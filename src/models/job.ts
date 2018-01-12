import {Host} from './host';
import {Schedule} from './schedule';
import {VirtualMachine} from './virtual_machine';

export class Job {
    id: string;
    name: string;
    schedule_id: string;
    source_retention: string;
    target_retention: string;
    sdc_vm_id: string;
    source_location: string;
    target_location: string;
    zfs_type: number;
    zfs_size: number;
    source_host_id: string;
    target_host_id: string;
    last_execution: Date;
    last_schedule: Date;
    enabled: boolean;
    offset: number;

    job_source_host?: Host;
    job_target_host?: Host;
    job_schedule?: Schedule;
    job_virtual_machine?: VirtualMachine;
}