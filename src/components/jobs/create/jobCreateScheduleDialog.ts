import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Job} from '../../../models/job';
import {Schedule} from '../../../models/schedule';
import {ScheduleService} from '../../../services/scheduleService';

@autoinject()
export class JobScheduleDialog {
    public job: Job;
    public offset: number = 0;
    public selected_schedule: Schedule;
    public schedules: any[];

    constructor(private dialogController: DialogController, private scheduleService: ScheduleService) { }

    async activate(job) {
        this.job = job;
        this.schedules = await this.scheduleService.get_schedules();
    }

    submit() {
        if (this.selected_schedule === null) {
            return;
        }

        this.job.schedule_id = this.selected_schedule.id;
        this.job.offset = this.offset;

        this.dialogController.ok(this.job);
    }
    
}