import {autoinject} from 'aurelia-framework';

import {Job} from '../../models/job';
import {JobService} from '../../services/jobService';

@autoinject()
export class JobView {

    public jobs: Job[];

    constructor(private jobService: JobService) {}

    async bind() {
        await this.load_jobs();
    }

    async load_jobs() {
        this.jobs = await this.jobService.get_jobs('', 'name', 'desc');
    }

    async update_job(id: number, job: Job) {
        await this.jobService.update_job(id, job);
        await this.load_jobs();
    }
}