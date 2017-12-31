import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Job} from '../../../models/job';
import {Schedule} from '../../../models/schedule';
import {ScheduleService} from '../../../services/scheduleService';

@autoinject()
export class JobScheduleDialog {
    public job: Job;
    public schedules: any[];

    constructor(private dialogController: DialogController, private scheduleService: ScheduleService) { }

    async activate(job) {
        this.job = job;
        this.schedules = await this.scheduleService.get_schedules();
    }

    submit() {
        if (this.job.schedule_id === null) {
            return;
        }

        this.dialogController.ok(this.job);
    }
    
}