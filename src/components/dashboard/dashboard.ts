import {autoinject} from 'aurelia-framework';

import {DashboardService} from "../../services/dashboardService";

@autoinject()
export class Dashboard {
    
    public nodes: any;
    
    constructor(private dashboardService: DashboardService){ }

    async bind() {
        this.nodes = await this.dashboardService.getDashboardData();
    }
}