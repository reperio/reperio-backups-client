import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Host} from '../../../models/host';
import {HostService} from '../../../services/hostService';
import {Job} from '../../../models/job';
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

    constructor(private dialogController: DialogController, private hostService: HostService, private scheduleService: ScheduleService, private virtualMachineService: VirtualMachineService) { }

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
    }

    submit() {
        if (this.job.schedule_id === null) {
            return;
        }
        
        this.job.source_retention = this.build_retention_policy(this.source);
        this.job.target_retention = this.build_retention_policy(this.target);

        this.dialogController.ok(this.job);
    }
    

    build_retention_policy(retention_values) {
        const policy = {
            retentions: [
                {
                    interval: 'quarter_hourly',
                    offset: 5,
                    retention: retention_values.fifteen
                },
                {
                    interval: "hourly",
                    offset: 30,
                    retention: retention_values.hourly
                },
                {
                    interval: "daily",
                    offset: 0,
                    retention: retention_values.daily
                },
                {
                    interval: "weekly",
                    offset: 0,
                    retention: retention_values.weekly
                },
                {
                    interval: "monthly",
                    offset: 0,
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
                obj.fifteen = policies[i].retention;
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
            fifteen: 1,
            hourly: 1,
            daily: 1,
            weekly: 1,
            monthly: 1
        };

        this.target = {
            fifteen: 4,
            hourly: 24,
            daily: 7,
            weekly: 4,
            monthly: 12
        };
    }

    can_edit_retention() {
        const policies = ['quarter_hourly', 'hourly', 'daily', 'weekly', 'monthly'];

        const schedule_index = policies.indexOf(this.selected_schedule.name);
        policies.forEach(policy => {
            const policy_index = policies.indexOf(policy);
            this.canEdit[policy] = !(schedule_index <= policy_index);
        });
    }
}