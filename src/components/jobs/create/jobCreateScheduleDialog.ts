import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Job} from '../../../models/job';
import {Schedule} from '../../../models/schedule';
import {ScheduleService} from '../../../services/scheduleService';

@autoinject()
export class JobScheduleDialog {
    public old_schedule_id: string;
    public job: Job;
    public schedules: any[] = [];

    public formState: any = {
        schedule: false,
        offset: false
    };

    constructor(private dialogController: DialogController, private scheduleService: ScheduleService) { }

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
        if (!this.validateForm()) {
            return;
        }

        if (this.job.schedule_id !== this.old_schedule_id) {
            this.job.source_retention = null;
            this.job.target_retention = null;
        }

        this.schedules.forEach(schedule => {
            if (this.job.schedule_id === schedule.id) {
                this.job.job_schedule = schedule;
            }
        });
        
        this.dialogController.ok(this.job);
    }

    validateForm() {
        let error = false;

        if (this.job.schedule_id === null) {
            error = true;
            this.formState.schedule = false;
        } else {
            this.formState.schedule = true;
        }

        if (this.job.offset === null) {
            error = true;
            this.formState.offset = false;
        } else {
            this.formState.offset = true;
        }

        return !error;
    }
}