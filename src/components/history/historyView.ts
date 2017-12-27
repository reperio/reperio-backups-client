import {autoinject} from 'aurelia-framework';

import {JobHistoryService} from '../../services/jobHistoryService';

@autoinject()
export class JobHistoryView {

    public historyEntries: any[];

    constructor(private jobHistoryService: JobHistoryService) {}

    async bind() {
        this.historyEntries = await this.jobHistoryService.getJobHistories();
    }
}