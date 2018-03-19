import {autoinject, observable} from 'aurelia-framework';

import {JobHistoryService} from '../../services/jobHistoryService';


import {GridOptions, GridApi, ColumnApi} from "ag-grid";
import HeaderComponent from "./headerComponent";
import HeaderGroupComponent from "./headerGroupComponent";
import DateComponent from "./dateComponent";
import RefData from "./refData";

@autoinject()
export class JobHistoryView {
    private gridOptions: GridOptions;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;
    private api: GridApi;
    private columnApi: ColumnApi;
    private query_params: any;

    constructor(private jobHistoryService: JobHistoryService) {
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
        }

        

        this.gridOptions.onGridReady = () => {
            this.api = this.gridOptions.api;
            var dataSource = {
                rowCount: null, // behave as infinite scroll
                getRows: async (params) => {
                    const history_entries = await this.load_history_entries(params);
                    params.successCallback(history_entries.data, history_entries.count);
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

    async load_history_entries(gridParams) {
        const history_entries = await this.jobHistoryService.getJobHistories(gridParams);

        history_entries.data.forEach((entry) => {
            if (entry.source_result === 0) {
                entry.source_result_name = 'Pending';
            } else if (entry.source_result === 1) {
                entry.source_result_name = 'Active';
            } else if (entry.source_result === 2) {
                entry.source_result_name = 'Success';
            } else if (entry.source_result === 3) {
                entry.source_result_name = 'Failed';
            } else {
                entry.source_result_name = 'Unknown';
            }
        });

        return history_entries;
    }



    private createColumnDefs() {
        this.columnDefs = [
            {
                headerName: 'Job',
                field: 'job_history_job.name',
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Source Node", 
                field: "job_history_job.job_source_host.name",
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Virtual Machine", 
                field: "job_history_job.job_virtual_machine.name", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Start Time", 
                field: "start_date_time", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "End Time", 
                field: "end_date_time", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Scheduled Time", 
                field: "schedule_date_time", 
                filter:'agTextColumnFilter',
                filterParams: {
                    apply: true,
                    filterOptions: ['startsWith']
                }
            },
            {
                headerName: "Status", 
                field: "result", 
                filter: 'text', 
                cellRenderer: this.statusRenderer
            },
            {
                headerName: "Source Snapshot", 
                field: "job_history_snapshot.source_host_status", 
                filter: 'text', 
                cellRenderer: this.snapshotStatusRenderer
            },
            {
                headerName: "Target Snapshot", 
                field: "job_history_snapshot.target_host_status", 
                filter: 'text', 
                cellRenderer: this.snapshotStatusRenderer
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

    private onReady() {
        this.calculateRowCount();
    }

    private onCellClicked($event) {
    }

    private onCellValueChanged($event) {
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
}

