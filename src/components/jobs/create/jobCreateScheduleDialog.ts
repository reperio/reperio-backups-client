import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import { Job } from '../../../models/job';
import { Schedule } from '../../../models/schedule';
import { ScheduleService } from '../../../services/scheduleService';

@autoinject()
export class JobScheduleDialog {
    public old_schedule_id: string;
    public job: Job;
    public schedules: any[] = [];
    public canContinue: boolean = false;

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
                console.log('found schedule');
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

        if ((!this.job.offset && this.job.offset !== 0) || this.job.offset < 0) {
            error = true;
            this.formState.offset = false;
        } else {
            if (this.job.schedule_id) {
                let job_schedule = null;
                this.schedules.forEach(schedule => {
                    console.log(this.job.schedule_id + ' - ' + schedule.id);
                    if (this.job.schedule_id === schedule.id) {
                        console.log('matched schedule');
                        job_schedule = schedule;
                    }
                });

                console.log(job_schedule);
                let max_offset = 0;
                switch (job_schedule.name) {
                    case 'quarter_hour':
                        max_offset = 15;
                        break;
                    case 'hourly':
                        max_offset = 60;
                        break;
                    case 'daily':
                        max_offset = 60 * 24;
                        break;
                    case 'weekly':
                        max_offset = 60 * 24 * 7;
                        break;
                    case 'monthly':
                        max_offset = 60 * 24 * 28;
                        break;
                }
                console.log(max_offset);
                if (this.job.offset < 0 || this.job.offset >= max_offset) {
                    error = true;
                    this.formState.offset = false;
                } else {
                    this.formState.offset = true;
                }
            } else {
                this.formState.offset = true;
            }

        }

        this.canContinue = !error;
        return !error;
    }
}