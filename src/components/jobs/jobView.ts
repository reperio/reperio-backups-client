import {autoinject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import * as toastr from 'toastr';
import * as $ from 'jquery';
import {Host} from '../../models/host';
import {HostService} from '../../services/hostService';
import {Job} from '../../models/job';
import {JobService} from '../../services/jobService';
import {DeleteDialog} from '../dialogs/deleteDialog';
import {JobCreateDetailsDialog} from './create/jobCreateDetailsDialog';
import {JobCreateRetentionDialog} from './create/jobCreateRetentionDialog';
import {JobEditDialog} from './edit/jobEditDialog';
import {JobScheduleDialog} from './create/jobCreateScheduleDialog';


@autoinject()
export class JobView {

    public jobs: Job[];
    public hosts: Host[];

    public filters: any[] = [
        { value: '', keys: ['job_source_host.id'] }
    ];

    constructor(private dialogService: DialogService, private jobService: JobService, private hostService: HostService) {}

    async bind() {
        await this.load_jobs();
        this.hosts = await this.hostService.get_hosts();
    }

    async load_jobs() {
        this.jobs = await this.jobService.get_jobs();
    }

    async update_job_enabled_status(id: string, job: Job) {
        await this.jobService.update_job(id, job);
        await this.load_jobs();
    }

    async edit_job(job){
        this.dialogService.open({viewModel: JobEditDialog, model: $.extend( {}, job), lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                const updated_job = response.output;
                await this.jobService.update_job(updated_job.id, updated_job);
                toastr.success('Job updated');
                await this.load_jobs();
            }
        });
    }

    async delete_job(id: string) {
        this.dialogService.open({viewModel: DeleteDialog, model: 'Are you sure you want to delete this job?', lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                await this.jobService.delete_job(id);
                await this.load_jobs();
            }
        });
    }

    async create_job(step_number: number, job: Job) {
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
                await this.load_jobs();
                toastr.success(`Job "${response.output.name}" was created successfully`);
                return;
            }
            return this.create_job(2, response.output);
        });
    }
}