import {autoinject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';

import {DashboardService} from "../../services/dashboardService";
import {EditHostDialog} from '../hosts/editHost';

@autoinject()
export class Dashboard {
    
    public nodes: any;
    
    constructor(private dashboardService: DashboardService, private dialogService: DialogService){ }

    async bind() {
        await this.load_hosts();
    }

    async load_hosts() {
        this.nodes = await this.dashboardService.getDashboardData();
    }

    async create_host() {
        this.dialogService.open({viewModel: EditHostDialog, model: null, lock: false}).whenClosed(async response => {
            await this.load_hosts();
        });
    }
}