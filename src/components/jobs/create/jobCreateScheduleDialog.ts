import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import * as _ from 'lodash';

import { Job } from '../../../models/job';
import {JobValidationService} from '../../../services/jobValidationService';
import { Schedule } from '../../../models/schedule';
import { ScheduleService } from '../../../services/scheduleService';

@autoinject()
export class JobScheduleDialog {
    public old_schedule_id: string;
    public job: Job;
    public schedules: any[] = [];

    public formState: any = null;

    constructor(private dialogController: DialogController, private jobValidationService: JobValidationService, private scheduleService: ScheduleService) { }

    async activate(job) {
        this.job = job;
        const schedules = await this.scheduleService.get_schedules();
        const schedule_names = ['quarter_hour', 'hourly', 'daily', 'weekly', 'monthly'];
        schedule_names.forEach(name => {
            schedules.forEach(schedule => {
                if (schedule.name === name) {
                    this.schedules.push(schedule);
                }
            });
        });
        this.old_schedule_id = this.job.schedule_id;

        this.validateForm();
    }

    submit() {
        if (!this.formState.is_valid_state) {
            return;
        }

        if (this.job.schedule_id !== this.old_schedule_id) {
            this.job.source_retention = null;
            this.job.target_retention = null;
        }

        this.job.job_schedule = _.find(this.schedules, schedule => {
            return this.job.schedule_id === schedule.id;
        });

        this.dialogController.ok(this.job);
    }

    async validateForm() {
       this.formState = await this.jobValidationService.validate_job_schedule(this.job);
       return this.formState.is_valid_state;
    }
}