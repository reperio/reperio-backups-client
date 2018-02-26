import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import * as toastr from 'toastr';

import {Job} from '../../../models/job';
import {JobService} from '../../../services/jobService';
import {Schedule} from '../../../models/schedule';

@autoinject()
export class JobCreateRetentionDialog {
    public job: Job;
    public source: any;
    public target: any;
    public canEdit: any = {};
    public canCreate: boolean = false;

    public formState: any = {
        source: {
            quarter_hourly: false,
            hourly: false,
            daily: false,
            weekly: false,
            monthly: false
        },
        target: {
            quarter_hourly: false,
            hourly: false,
            daily: false,
            weekly: false,
            monthly: false
        }
    }

    constructor(private dialogController: DialogController, private jobService: JobService) { }

    async activate(job) {
        this.job = job;

        if (this.job.source_retention !== null && this.job.source_retention !== '') {
            const source_retention = JSON.parse(this.job.source_retention).retentions;
            this.source = {};
            this.parse_retention_policies(source_retention, 1);
        } else {
            this.source = {
                quarter_hourly: 0,
                hourly: 0,
                daily: 0,
                weekly: 0,
                monthly: 0
            };
        }

        if (this.job.target_retention !== null && this.job.target_retention !== '') {
            const target_retention = JSON.parse(this.job.target_retention).retentions;
            this.target = {};
            this.parse_retention_policies(target_retention, 2);
        } else {
            const policies = ['quarter_hourly', 'hourly', 'daily', 'weekly', 'monthly'];
            const retentions = [4, 24, 7, 4, 12];

            this.target = {};

            const schedule_index = policies.indexOf(this.job.job_schedule.name);
            policies.forEach(policy => {
                const policy_index = policies.indexOf(policy);
                this.target[policy] = !(schedule_index <= policy_index) ? 0 : retentions[policy_index];
            });
        }
        this.set_retention_values_disabled_status();

        this.validateForm();
    }

    back() {
        this.job.source_retention = this.build_retention_policy(this.source);
        this.job.target_retention = this.build_retention_policy(this.target);

        this.dialogController.cancel(this.job);
    }

    async submit() {
        if (!this.validateForm()) {
            return;
        }

        this.job.source_retention = this.build_retention_policy(this.source);
        this.job.target_retention = this.build_retention_policy(this.target);
        
        try {
            const result = await this.jobService.create_job(this.job);        
            this.dialogController.ok(this.job);
        } catch (err) {
            const message: string = err.message;
            const messages = message.split(',');
            messages.forEach(message => {
                toastr.error(message);
            });
        }
    }
    
    build_retention_policy(retention_values) {
        const policy = {
            retentions: [
                {
                    interval: 'quarter_hourly',
                    retention: retention_values.quarter_hourly
                },
                {
                    interval: "hourly",
                    retention: retention_values.hourly
                },
                {
                    interval: "daily",
                    retention: retention_values.daily
                },
                {
                    interval: "weekly",
                    retention: retention_values.weekly
                },
                {
                    interval: "monthly",
                    retention: retention_values.monthly
                }
            ]
        };

        return JSON.stringify(policy);
    }

    parse_retention_policies(policies, destination) {
        let obj: any = {};
        for (let i = 0; i < policies.length; i++) {
            if (policies[i].interval == 'quarter_hourly') {
                obj.quarter_hourly = policies[i].retention;
            } else if (policies[i].interval == 'hourly') {
                obj.hourly = policies[i].retention;
            } else if (policies[i].interval == 'daily') {
                obj.daily = policies[i].retention;
            } else if (policies[i].interval == 'weekly') {
                obj.weekly = policies[i].retention;
            } else if (policies[i].interval == 'monthly') {
                obj.monthly = policies[i].retention;
            }
        }

        if (destination == 1) {
            this.source = obj;
        } else if (destination == 2) {
            this.target = obj;
        }
    }

    set_retention_values_disabled_status() {
        const policies = ['quarter_hourly', 'hourly', 'daily', 'weekly', 'monthly'];

        const schedule_index = policies.indexOf(this.job.job_schedule.name);
        policies.forEach(policy => {
            const policy_index = policies.indexOf(policy);
            this.canEdit[policy] = !(schedule_index <= policy_index);
        });
    }

    validateForm() {
        let error = false;
        if (this.source.quarter_hourly === null || this.source.quarter_hourly === '') {
            error = true;
            this.formState.source.quarter_hourly = false;
        } else {
            this.formState.source.quarter_hourly = true;
        }
        if (this.source.hourly === null || this.source.hourly === '') {
            error = true;
            this.formState.source.hourly = false;
        } else {
            this.formState.source.hourly = true;
        }
        if (this.source.daily === null || this.source.daily === '') {
            error = true;
            this.formState.source.daily = false;
        } else {
            this.formState.source.daily = true;
        }
        if (this.source.weekly === null || this.source.weekly === '') {
            error = true;
            this.formState.source.weekly = false;
        } else {
            this.formState.source.weekly = true;
        }
        if (this.source.monthly === null || this.source.monthly === '') {
            error = true;
            this.formState.source.monthly = false;
        } else {
            this.formState.source.monthly = true;
        }

        if (this.target.quarter_hourly === null || this.target.quarter_hourly === '') {
            error = true;
            this.formState.target.quarter_hourly = false;
        } else {
            this.formState.target.quarter_hourly = true;
        }
        if (this.target.hourly === null || this.target.hourly === '') {
            error = true;
            this.formState.target.hourly = false;
        } else {
            this.formState.target.hourly = true;
        }
        if (this.target.daily === null || this.target.daily === '') {
            error = true;
            this.formState.target.daily = false;
        } else {
            this.formState.target.daily = true;
        }
        if (this.target.weekly === null || this.target.weekly === '') {
            error = true;
            this.formState.target.weekly = false;
        } else {
            this.formState.target.weekly = true;
        }
        if (this.target.monthly === null || this.target.monthly === '') {
            error = true;
            this.formState.target.monthly = false;
        } else {
            this.formState.target.monthly = true;
        }

        this.canCreate = !error;
        return !error;
    }
}