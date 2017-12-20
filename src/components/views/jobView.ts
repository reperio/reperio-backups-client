import {autoinject} from 'aurelia-framework';

import {JobService} from '../../services/jobService';

@autoinject()
export class JobView {

    public jobs: any[];

    constructor(private jobService: JobService) {}

    async bind() {
        this.jobs = await this.jobService.getJobs();
    }
}