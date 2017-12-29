import {autoinject} from 'aurelia-framework';

import {Host} from '../../models/host';
import {HostService} from '../../services/hostService';
import {Job} from '../../models/job';
import {JobService} from '../../services/jobService';

@autoinject()
export class JobView {

    public jobs: Job[];
    public hosts: Host[];

    public filters: any[] = [
        { value: '', keys: ['job_source_host.id'] }
    ];

    constructor(private jobService: JobService, private hostService: HostService) {}

    async bind() {
        await this.load_jobs();
        this.hosts = await this.hostService.get_hosts();
    }

    async load_jobs() {
        this.jobs = await this.jobService.get_jobs();
    }

    async update_job(id: string, job: Job) {
        await this.jobService.update_job(id, job);
        await this.load_jobs();
    }

    async delete_job(id: string) {
        await this.jobService.delete_job(id);
        await this.load_jobs();
    }
}