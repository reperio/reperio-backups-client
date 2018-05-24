import { ColumnApi, GridApi, GridOptions } from "ag-grid";
import { autoinject } from 'aurelia-framework';
import { JobService } from '../../services/jobService';
import DateComponent from "../shared/dateComponent";
import SwitchComponent from "../shared/switchComponent";

@autoinject()
export class JobView {
    private gridOptions: GridOptions;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;
    private api: GridApi;
    private columnApi: ColumnApi;
    private query_params: any;

    constructor(private jobService: JobService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.gridOptions.dateComponent = <any>DateComponent;
        this.gridOptions.pagination = true;
        this.gridOptions.enableServerSideSorting = true,
        this.gridOptions.enableServerSideFilter = true,
        this.gridOptions.rowModelType = 'infinite';
        this.gridOptions.paginationPageSize = 100;
        this.gridOptions.paginationAutoPageSize = true;
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
        this.gridOptions.onCellValueChanged = async (params: any) => { //this is actually getting a job from the switch component
            delete params.last_result;
            this.jobService.update_job(params.id, params);
        };

        this.gridOptions.onGridReady = () => {
            this.api = this.gridOptions.api;
            var dataSource = {
                rowCount: null, // behave as infinite scroll
                getRows: async (params) => {
                    const jobs = await this.load_jobs(params);
                    params.successCallback(jobs, jobs.length);
                    this.api.sizeColumnsToFit()
                }
            };
            this.api.setDatasource(dataSource);
            this.columnApi = this.gridOptions.columnApi;

            if (this.query_params.filter === 'source_node') {
                const source_node_filter_component = this.gridOptions.api.getFilterInstance('job_history_job.job_source_host.name');
                source_node_filter_component.setModel({
                    type: 'contains',
                    filter: this.query_params.value
                });
                this.gridOptions.api.onFilterChanged();
            }
        }
    }

    activate(params, queryString, routeConfig) {
        this.query_params = params;
    }

    async load_jobs(gridParams) {
        const jobs = await this.jobService.get_jobs(gridParams);

        return jobs;
    }



    private createColumnDefs() {
        this.columnDefs = [
            {
                headerName: 'Virtual Machine',
                field: 'job_virtual_machine.name',
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Job", 
                field: "name",
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Source", 
                field: "job_source_host.name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Target", 
                field: "job_target_host.name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Schedule", 
                field: "job_schedule.display_name", 
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
                filter: 'text', 
                cellRenderer: SwitchComponent
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
        console.log('onReady');
        console.log($event);
        this.calculateRowCount();
    }

    private onCellClicked($event) {
    }

    private onCellValueChanged($event) {
        console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    }

    private onRowValueChanged($event) {
        console.log('onRowValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    }

    private onCellDoubleClicked($event) {
    }

    private onCellContextMenu($event) {
    }

    private onCellFocused($event) {
    }

    private onRowSelected($event) {
        // taking out, as when we 'select all', it prints to much to the console!!
        // console.log('onRowSelected: ' + $event.node.data.name);
    }

    private onSelectionChanged() {
    }

    private onBeforeFilterChanged() {
    }

    private onAfterFilterChanged() {
    }

    private onFilterModified() {
    }

    private onBeforeSortChanged() {
    }

    private onAfterSortChanged() {
    }

    private onVirtualRowRemoved($event) {
        // because this event gets fired LOTS of times, we don't print it to the
        // console. if you want to see it, just uncomment out this line
        // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
    }

    private onRowClicked($event) {
    }

    private onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    private onColumnEvent($event) {
    }

    private statusRenderer(params) {
        
        const styles = {
            0: 'r-job-history-pending',
            1: 'r-job-history-active',
            2: 'r-job-history-success',
            3: 'r-job-history-failed',
        };
        
        const template = `<div class='r-job-history-status ${styles[params.value]}'>&nbsp;</div>`;
        return template;
    }

    private snapshotStatusRenderer(params) {
        const status_map = {
            0: 'default',
            1: 'created',
            2: 'deleted',
            3: 'failed',
            4: 'receive_failed'
        };

        return status_map[params.value];
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

    changeJobStatus(params: any) {
        console.log(params);
    }
}











// import {autoinject} from 'aurelia-framework';
// import {DialogService} from 'aurelia-dialog';
// import * as toastr from 'toastr';
// import * as $ from 'jquery';
// import * as _ from 'lodash';
// import {Host} from '../../models/host';
// import {HostService} from '../../services/hostService';
// import {Job} from '../../models/job';
// import {JobService} from '../../services/jobService';
// import {DeleteDialog} from '../dialogs/deleteDialog';
// import {JobCreateDetailsDialog} from './create/jobCreateDetailsDialog';
// import {JobCreateRetentionDialog} from './create/jobCreateRetentionDialog';
// import {JobEditDialog} from './edit/jobEditDialog';
// import {JobScheduleDialog} from './create/jobCreateScheduleDialog';
// import {VirtualMachine} from '../../models/virtual_machine';
// import {VirtualMachineService} from '../../services/virtualMachineService';

// @autoinject()
// export class JobView {
//     public jobs: Job[];
//     public hosts: Host[];
//     public filtered_virtual_machines: VirtualMachine[];
//     public virtual_machines: VirtualMachine[];
//     public selected_host: Host;
//     public table: any;
//     public $displayData: any[];

//     public filters: any[] = [
//         { value: '', keys: ['job_source_host.id'] },
//         { value: '', keys: ['job_virtual_machine.id'] }
//     ];

//     constructor(private dialogService: DialogService, private jobService: JobService, private hostService: HostService, private virtualMachineService: VirtualMachineService) { }

//     async bind() {
//         await this.load_jobs();
//         this.hosts = await this.hostService.get_hosts();
//         this.virtual_machines = await this.virtualMachineService.getVirtualMachines();
//         this.filtered_virtual_machines = this.virtual_machines;
        

//         //data.bind: jobs; display-data.bind: $displayData; filters.bind: filters
//     }

//     async attached() {
//         console.log(this.table);
//     }

//     async load_jobs() {
//         this.jobs = await this.jobService.get_jobs();
//     }

//     async update_job_enabled_status(id: string, job: Job) {
//         await this.jobService.update_job(id, job);
//         await this.load_jobs();
//     }

//     async update_selected_host() {
//         this.hosts.forEach(host => {
//             if (host.id === this.filters[0].value) this.selected_host = host;
//         });
//         this.filters[1].value = '';
//         console.log(JSON.stringify(this.filters[0].value));
//         if (this.selected_host === null || typeof this.selected_host === 'undefined') {
//             console.log('no filter');
//             this.filtered_virtual_machines = this.virtual_machines;
//         } else {
//             console.log('filter');
//             this.filtered_virtual_machines = this.virtual_machines.filter(vm => {
//                 return vm.host_id === this.selected_host.sdc_id;
//             });
//         }

//         this.filtered_virtual_machines.sort((a, b) => {
//             const a_value = a.name == '' ? a.id.toUpperCase() : a.name.toUpperCase();
//             const b_value = b.name == '' ? b.id.toUpperCase() : b.name.toUpperCase();

//             return a_value < b_value ? -1 : 1;
//         });
//     }

//     update_sort_column() {
//         console.log(this.table);
//         if (this.filters[1].value !== ''){
//             this.table.sortKey = 'name';
//             $('#vm_header').removeClass('aut-asc');
//             $('#vm_header').removeClass('aut-desc');
//             $('#vm_header').addClass('aut-sortable');
//             $('#job_header').addClass('aut-asc');
//         } else {
//             $('#job_header').removeClass('aut-asc');
//             $('#job_header').removeClass('aut-desc');
//             $('#job_header').addClass('aut-sortable');
//             $('#vm_header').addClass('aut-asc');
//             this.table.sortKey = 'job_virtual_machine.name';
//         }
//         this.table.doSort(this.$displayData);
//     }

//     async edit_job(job){
//         this.dialogService.open({viewModel: JobEditDialog, model: $.extend( {}, job), lock: false}).whenClosed(async (response) => {
//             if (!response.wasCancelled) {
//                 const updated_job = response.output;
//                 await this.jobService.update_job(updated_job.id, updated_job);
//                 toastr.success('Job updated');
//                 await this.load_jobs();
//             }
//         });
//     }

//     async delete_job(id: string) {
//         this.dialogService.open({viewModel: DeleteDialog, model: 'Are you sure you want to delete this job?', lock: false}).whenClosed(async (response) => {
//             if (!response.wasCancelled) {
//                 await this.jobService.delete_job(id);
//                 await this.load_jobs();
//             }
//         });
//     }

//     async create_job(step_number: number, job: Job) {
//        if(step_number === 1) {
//            this.open_job_details_modal(job);
//        } else if (step_number === 2) {
//            this.open_job_schedule_modal(job);
//        } else if (step_number === 3) {
//            this.open_job_retention_modal(job);
//        }
//     }

//     async open_job_details_modal(job) {
//         this.dialogService.open({viewModel: JobCreateDetailsDialog, model: job, lock: false}).whenClosed(async (response) => {
//             if (!response.wasCancelled) {
//                 return this.create_job(2, response.output);
//             }
//             return null;
//         });
//     }

//     async open_job_schedule_modal(job) {
//         this.dialogService.open({viewModel: JobScheduleDialog, model: job, lock: false}).whenClosed(async (response) => {
//             if (!response.wasCancelled) {
//                 return this.create_job(3, response.output);
//             }
//             return this.create_job(1, response.output);
//         });
//     }

//     async open_job_retention_modal(job) {
//         this.dialogService.open({viewModel: JobCreateRetentionDialog, model: job, lock: false}).whenClosed(async (response) => {
//             if (!response.wasCancelled) {
//                 await this.load_jobs();
//                 toastr.success(`Job "${response.output.name}" was created successfully`);
//                 return;
//             }
//             return this.create_job(2, response.output);
//         });
//     }
// }