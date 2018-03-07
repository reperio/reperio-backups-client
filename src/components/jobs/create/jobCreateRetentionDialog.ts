import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import * as toastr from 'toastr';

import {Job} from '../../../models/job';
import {JobService} from '../../../services/jobService';
import {JobValidationService} from '../../../services/jobValidationService';
import {Schedule} from '../../../models/schedule';

@autoinject()
export class JobCreateRetentionDialog {
    public job: Job;
    public source: any;
    public target: any;
    public canEdit: any = {};
    public formState: any = null;

    constructor(private dialogController: DialogController, private jobService: JobService, private jobValidationService: JobValidationService) { }

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
        if (!this.formState.is_valid_state) {
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

    async validateForm() {
        this.formState = await this.jobValidationService.validate_job_retention(this.source, this.target);
        return this.formState.is_valid_state;
    }
}