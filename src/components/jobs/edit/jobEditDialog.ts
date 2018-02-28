import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import * as toastr from 'toastr';

import {Host} from '../../../models/host';
import {HostService} from '../../../services/hostService';
import {Job} from '../../../models/job';
import {JobService} from '../../../services/jobService';
import {Schedule} from '../../../models/schedule';
import {ScheduleService} from '../../../services/scheduleService';
import {VirtualMachine} from '../../../models/virtual_machine';
import {VirtualMachineService} from '../../../services/virtualMachineService';

@autoinject()
export class JobEditDialog {
    public job: Job;
    public schedules: Schedule[] = [];
    public hosts: any[];
    public selected_schedule: Schedule;
    public selected_source_host: Host;
    public virtual_machines: VirtualMachine[];
    public source: any;
    public target: any;
    public canEdit: any = {};
    public canSave: boolean = false;
    public formState = {
        job_name: false,
        schedule: false,
        offset: false,
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
    };

    constructor(private dialogController: DialogController, private hostService: HostService, private jobService: JobService, private scheduleService: ScheduleService, private virtualMachineService: VirtualMachineService) { }

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

        this.hosts = await this.hostService.get_hosts();

        for (let i = 0; i < this.hosts.length; i++) {
            if (this.hosts[i].id === this.job.source_host_id) {
                this.selected_source_host = this.hosts[i];
            }
        }

        const source_retention = JSON.parse(this.job.source_retention).retentions;
        this.parse_retention_policies(source_retention, 1);
        const target_retention = JSON.parse(this.job.target_retention).retentions;
        this.parse_retention_policies(target_retention, 2);

        this.selected_schedule = this.job.job_schedule;
        this.can_edit_retention();

        this.validateForm();
    }

    async submit() {
        if (this.job.schedule_id === null) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }
        
        this.job.source_retention = this.build_retention_policy(this.source);
        this.job.target_retention = this.build_retention_policy(this.target);

        try {
            const result = await this.jobService.update_job(this.job.id, this.job);        
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
 
    set_default_retentions() {
        this.schedules.forEach(schedule => {
            if (this.job.schedule_id == schedule.id) {
                this.selected_schedule = schedule;
            }
        });

        this.can_edit_retention();

        this.source = {
            quarter_hourly: 0,
            hourly: 0,
            daily: 0,
            weekly: 0,
            monthly: 0
        };

        const policies = ['quarter_hourly', 'hourly', 'daily', 'weekly', 'monthly'];
        const retentions = [4, 24, 7, 4, 12];

        this.target = {};
        const schedule_index = policies.indexOf(this.selected_schedule.name);
        policies.forEach(policy => {
            const policy_index = policies.indexOf(policy);
            this.target[policy] = !(schedule_index <= policy_index) ? 0 : retentions[policy_index];
        });

        this.validateForm();
    }

    can_edit_retention() {
        const policies = ['quarter_hourly', 'hourly', 'daily', 'weekly', 'monthly'];

        const schedule_index = policies.indexOf(this.selected_schedule.name);
        policies.forEach(policy => {
            const policy_index = policies.indexOf(policy);
            this.canEdit[policy] = !(schedule_index <= policy_index);
        });
    }

    validateForm() {
        let error = false;

        if (this.job.name === null || !this.job.name || !this.job.name.trim()) {
            error = true;
            this.formState.job_name = false;
        } else {
            this.formState.job_name = true;
        }
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

        this.canSave = !error;
        return !error;
    }
}