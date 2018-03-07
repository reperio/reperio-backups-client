import {autoinject} from 'aurelia-framework';
import * as _ from 'lodash';

import {Job} from '../models/job';
import {Schedule} from '../models/schedule';
import {ScheduleService} from './scheduleService';

@autoinject()
export class JobValidationService {
    constructor (private scheduleService: ScheduleService) { }

    private schedules: Schedule[];
    private formState: any = null;
    private validate_whole_job: boolean = false;

    async validate_job(job: Job, source: any, target: any): Promise<any> {
        this.formState = this.get_new_form_state();
        this.validate_whole_job = true;

        await this.validate_job_details(job);
        await this.validate_job_retention(source, target);
        await this.validate_job_schedule(job);

        this.validate_whole_job = false;
        return this.formState;
    }

    async validate_job_details(job): Promise<any> {
        this.formState = this.get_new_form_state();
        
        if (!this.validate_whole_job) {
            if (job.source_host_id === null) {
                this.formState.is_valid_state = false;
                this.formState.source_node = false;
            } else {
                this.formState.source_node = true;
            }
            if (job.sdc_vm_id === null) {
                this.formState.is_valid_state = false;
                this.formState.virtual_machine = false;
            } else {
                this.formState.virtual_machine = true;
            }
            if (job.target_host_id === null) { 
                this.formState.is_valid_state = false;
                this.formState.target_node = false;
            } else {
                this.formState.target_node = true;
            }
            if (job.source_location === null) {
                this.formState.is_valid_state = false;
                this.formState.dataset = false;
            } else {
                this.formState.dataset = true;
            }
        } else {
            this.formState.source_node = true;
            this.formState.virtual_machine = true;
            this.formState.target_node = true;
            this.formState.dataset = true;
        }

        if (!job.name || !job.name.trim()) {
            this.formState.is_valid_state = false;
            this.formState.job_name = false;
        } else {
            this.formState.job_name = true;
        }

        return this.formState;
    }

    async validate_job_schedule(job): Promise<any> {
        const schedules = await this.scheduleService.get_schedules();
        this.formState = this.get_new_form_state();

        if (job.schedule_id === null) {
            this.formState.is_valid_state = false;
            this.formState.schedule = false;
        } else {
            this.formState.schedule = true;
        }

        if (job.offset == null || job.offset < 0) {
            this.formState.is_valid_state = false;
            this.formState.offset = false;
        } else {
            if (job.schedule_id) {
                let job_schedule = _.find(schedules, schedule => {
                    return job.schedule_id === schedule.id;
                });
                
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
                if (job.offset < 0 || job.offset >= max_offset) {
                    this.formState.is_valid_state = false;
                    this.formState.offset = false;
                } else {
                    this.formState.offset = true;
                }
            } else {
                this.formState.offset = true;
            }
        }
        
        return this.formState;
    }

    async validate_job_retention(source: any, target: any): Promise<any> {
        this.formState = this.get_new_form_state();

        if (source.quarter_hourly === null || source.quarter_hourly === '') {
            this.formState.is_valid_state = false;
            this.formState.source.quarter_hourly = false;
        } else {
            this.formState.source.quarter_hourly = true;
        }
        if (source.hourly === null || source.hourly === '') {
            this.formState.is_valid_state = false;
            this.formState.source.hourly = false;
        } else {
            this.formState.source.hourly = true;
        }
        if (source.daily === null || source.daily === '') {
            this.formState.is_valid_state = false;
            this.formState.source.daily = false;
        } else {
            this.formState.source.daily = true;
        }
        if (source.weekly === null || source.weekly === '') {
            this.formState.is_valid_state = false;
            this.formState.source.weekly = false;
        } else {
            this.formState.source.weekly = true;
        }
        if (source.monthly === null || source.monthly === '') {
            this.formState.is_valid_state = false;
            this.formState.source.monthly = false;
        } else {
            this.formState.source.monthly = true;
        }

        if (target.quarter_hourly === null || target.quarter_hourly === '') {
            this.formState.is_valid_state = false;
            this.formState.target.quarter_hourly = false;
        } else {
            this.formState.target.quarter_hourly = true;
        }
        if (target.hourly === null || target.hourly === '') {
            this.formState.is_valid_state = false;
            this.formState.target.hourly = false;
        } else {
            this.formState.target.hourly = true;
        }
        if (target.daily === null || target.daily === '') {
            this.formState.is_valid_state = false;
            this.formState.target.daily = false;
        } else {
            this.formState.target.daily = true;
        }
        if (target.weekly === null || target.weekly === '') {
            this.formState.is_valid_state = false;
            this.formState.target.weekly = false;
        } else {
            this.formState.target.weekly = true;
        }
        if (target.monthly === null || target.monthly === '') {
            this.formState.is_valid_state = false;
            this.formState.target.monthly = false;
        } else {
            this.formState.target.monthly = true;
        }

        return this.formState;
    }

    private get_new_form_state(): any {
        if (this.validate_whole_job) {
            return this.formState;
        }

        return {
            is_valid_state: true,
            source_node: false,
            virtual_machine: false,
            target_node: false,
            dataset: false,
            job_name: false,
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
            },
            schedule: false,
            offset: false
        };
    }
}