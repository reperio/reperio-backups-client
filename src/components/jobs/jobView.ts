import { ColumnApi, GridApi, GridOptions } from "ag-grid";
import { DialogService } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import * as toastr from 'toastr';
import { HostService } from '../../services/hostService';
import { JobDetailsService } from '../../services/jobDetailsService';
import { JobService } from '../../services/jobService';
import { VirtualMachineService } from '../../services/virtualMachineService';
import { DeleteDialog } from '../dialogs/deleteDialog';
import DateComponent from "../shared/dateComponent";
import SwitchComponent from "../shared/switchComponent";
import { JobCreateDetailsDialog } from './create/jobCreateDetailsDialog';
import { JobCreateRetentionDialog } from './create/jobCreateRetentionDialog';
import { JobScheduleDialog } from './create/jobCreateScheduleDialog';
import { JobEditDialog } from "./edit/jobEditDialog";

@autoinject()
export class JobView {
    private gridOptions: GridOptions;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;
    private api: GridApi;
    private columnApi: ColumnApi;
    private query_params: any;
    private dataSource: any;
    private hosts: any[];
    private virtual_machines: any[];
    private filtered_virtual_machines: any[];
    private selected_host_name: any;
    private selected_virtual_machine_name: any;

    constructor(private element: Element, private deleteDialog: DeleteDialog, private dialogService: DialogService, public hostService: HostService, private jobDetailsService: JobDetailsService, private jobEditDialog: JobEditDialog, private jobService: JobService, private virtualMachineService: VirtualMachineService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.gridOptions.dateComponent = <any>DateComponent;
        this.gridOptions.pagination = true;
        this.gridOptions.enableServerSideSorting = true,
        this.gridOptions.enableServerSideFilter = true,
        this.gridOptions.rowModelType = 'infinite';
        this.gridOptions.paginationPageSize = 25;
        this.gridOptions.paginationAutoPageSize = false;
        this.gridOptions.unSortIcon = true;
        this.gridOptions.defaultColDef = {
            headerComponentParams : {
                menuIcon: 'fa-bars',
                template:
                '<div class="ag-cell-label-container" role="presentation">' +
                '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
                '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
                '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>' +
                '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>' +
                '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>' +
                '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>' +
                '    <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
                '    <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>' +
                '  </div>' +
                '</div>'
            }
        };
        this.gridOptions.suppressClickEdit = true;
        this.gridOptions.onCellValueChanged = async (params: any) => {
            delete params.last_result;
            this.jobService.update_job_enabled_status(params.job_id, params.enabled);
        };

        this.gridOptions.onGridReady = () => {
            this.api = this.gridOptions.api;
            this.dataSource = {
                rowCount: null, // behave as infinite scroll
                getRows: async (params) => {
                    const jobs: any = await this.load_jobs(params);
                    params.successCallback(jobs.data, jobs.count);
                    this.api.sizeColumnsToFit()
                }
            };
            this.api.setDatasource(this.dataSource);
            this.columnApi = this.gridOptions.columnApi;

            if (this.query_params.filter === 'source_node') {
                const source_node_filter_component = this.gridOptions.api.getFilterInstance('job_history_job.job_source_host.name');
                source_node_filter_component.setModel({
                    type: 'contains',
                    filter: this.query_params.value
                });
                this.gridOptions.api.onFilterChanged();
            }

            this.add_action_handlers();
        }
    }

    async bind() {
        this.hosts = await this.hostService.get_hosts();
        this.virtual_machines = await this.virtualMachineService.getVirtualMachines();
        this.filtered_virtual_machines = this.virtual_machines;
    }

    add_action_handlers() {
        setInterval(() => {
            const editElements: any = this.element.querySelectorAll('.edit-icon');
            for(let i = 0; i < editElements.length; i++) {
                editElements[i].onclick = (params) => {
                    this.edit_job(params.srcElement.dataset.job_id);
                };
            }

            const deleteElements: any = this.element.querySelectorAll('.delete-icon');
            for(let i = 0; i < deleteElements.length; i++) {
                deleteElements[i].onclick = (params) => {
                    this.delete_job(params.srcElement.dataset.job_id);
                };
            }
        }, 100);
    }

    activate(params, queryString, routeConfig) {
        this.query_params = params;
    }

    async load_jobs(gridParams) {
        const jobs = await this.jobDetailsService.getAllJobDetails(gridParams);

        return jobs;
    }

    private createColumnDefs() {
        this.columnDefs = [
            {
                headerName: 'Virtual Machine',
                field: 'virtual_machine_name',
                filter:'agTextColumnFilter',
                sort: 'asc',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Job", 
                field: "job_name",
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Source", 
                field: "source_host_name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Target", 
                field: "target_host_name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: 'Dataset Type',
                field: 'dataset_type',
                filter: 'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Schedule", 
                field: "schedule_name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Last Execution", 
                field: "last_execution", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Enabled", 
                field: "enabled", 
                suppressMenu: true,
                suppressSorting: true,
                cellRenderer: SwitchComponent
            },
            {
                headerName: '',
                cellRenderer: this.actionsRenderer,
                suppressMenu: true,
                suppressSorting: true
            }            
        ];
    }

    private calculateRowCount() {
        if (this.gridOptions.api && this.rowData) {
            const model = this.gridOptions.api.getModel();
            const totalRows = this.rowData.length;
            const processedRows = model.getRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    }

    private onModelUpdated() {
        this.calculateRowCount();
    }

    public onReady($event) {
        this.calculateRowCount();
    }


    private onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    private actionsRenderer(params) {
        if (params.data === null || typeof params.data === 'undefined' || params.data.job_id === null) {
            return '';
        }
        const template = `<a href="javascript:void(0)" class="edit-icon" click.delegate="$this.edit_job(job)"><span class="oi oi-pencil" data-job_id="${params.data.job_id}" title="Edit Job" aria-hidden="true"></span></a>
                          <a href="javascript:void(0)" class="delete-icon" click.delegate="delete_job(job.id)"><span class="oi oi-circle-x" data-job_id="${params.data.job_id}" title="Delete Job" aria-hidden="true"></span></a>`;
        return template;
    }

    private enabledRenderer(params) {
        const template = `<div>
                                <label class="r-switch">
                                    <input type="checkbox" ${params.enabled ? 'checked' : ''} change.delegate="changeJobStatus(this)" />
                                    <span class="slider round">
                                         ${params.enabled ? '<span class="slider-text-on"></span>' : '<span class="slider-text-off">OFF</span>'} 
                                    </span>
                                </label>
                            </div>`;
        return template;
    }

    async edit_job(job_id){
        const job = await this.jobService.get_job(job_id);

        this.dialogService.open({viewModel: JobEditDialog, model: $.extend( {}, job), lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                const updated_job = response.output;
                try {
                    await this.jobService.update_job(updated_job.id, updated_job);
                    toastr.success('Job updated successfully');
                } catch (err) {
                    toastr.error('Failed to update job');
                }
                this.api.setDatasource(this.dataSource);
            }
        });
    }

    async delete_job(id: string) {
        this.dialogService.open({viewModel: DeleteDialog, model: 'Are you sure you want to delete this job?', lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                try {
                    await this.jobService.delete_job(id);
                    toastr.success('Job deleted successfully');
                } catch (err) {
                    toastr.error('Failed to delete job');
                }
                
                this.api.setDatasource(this.dataSource);
            }
        });
    }

    async create_job(step_number: number, job: any) {
        if(step_number === 1) {
            this.open_job_details_modal(job);
        } else if (step_number === 2) {
            this.open_job_schedule_modal(job);
        } else if (step_number === 3) {
            this.open_job_retention_modal(job);
        }
    }

    async open_job_details_modal(job) {
        this.dialogService.open({viewModel: JobCreateDetailsDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                return this.create_job(2, response.output);
            }
            return null;
        });
    }

    async open_job_schedule_modal(job) {
        this.dialogService.open({viewModel: JobScheduleDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                return this.create_job(3, response.output);
            }
            return this.create_job(1, response.output);
        });
    }

    async open_job_retention_modal(job) {
        this.dialogService.open({viewModel: JobCreateRetentionDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                toastr.success(`Job "${response.output.name}" was created successfully`);
                this.api.setDatasource(this.dataSource);
                this.add_action_handlers();
                return;
            }
            return this.create_job(2, response.output);
        });
    }

    async update_selected_host() {
        const source_node_filter_component = this.gridOptions.api.getFilterInstance('source_host_name');
        source_node_filter_component.setModel({
            type: 'contains',
            filter: this.selected_host_name
        });
        this.api.setDatasource(this.dataSource);

        let selected_host = null;
        for (let i = 0; i < this.hosts.length; i++) {
            if (this.hosts[i].name === this.selected_host_name) {
                selected_host = this.hosts[i];
            }
        }

        if (selected_host !== null) {
            if (this.selected_host_name === null || typeof this.selected_host_name === 'undefined') {
                this.filtered_virtual_machines = this.virtual_machines;
            } else {
                this.filtered_virtual_machines = this.virtual_machines.filter(vm => {
                    return vm.host_id === selected_host.sdc_id;
                });
            }
        }
    }

    async update_selected_virtual_machine() {
        const virtual_machine_filter_component = this.gridOptions.api.getFilterInstance('virtual_machine_name');
        virtual_machine_filter_component.setModel({
            type: 'contains',
            filter: this.selected_virtual_machine_name
        });
        this.api.setDatasource(this.dataSource);
    }
}