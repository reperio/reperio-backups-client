import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Host} from '../../../models/host';
import {HostService} from '../../../services/hostService';
import {Job} from '../../../models/job';
import {VirtualMachine} from '../../../models/virtual_machine';
import {VirtualMachineService} from '../../../services/virtualMachineService';

@autoinject()
export class JobCreateDetailsDialog {
    public can_select_virtual_machine: boolean;
    public can_select_source_location: boolean;
    public can_edit_target_location: boolean;

    public job: Job;
    public hosts: Host[];
    public selected_source_host: Host;
    public virtual_machines: any[];
    public vm_brand: string;
    public vm_name: string;
    public zfs_filesystems: string[] = [];
    

    constructor(private dialogController: DialogController, private hostService: HostService, private virtualMachineService: VirtualMachineService) { }

    async activate(job) {
        this.hosts = await this.hostService.get_hosts();
        
        if (job !== null) {
            this.job = job;
            this.virtual_machines = await this.virtualMachineService.get_virtual_machines_by_host_id(this.job.source_host_id);
            const vm_record = await this.virtualMachineService.get_virtual_machine_record(this.job.source_host_id, this.job.sdc_vm_id);
            this.parse_vm_record(vm_record);
            this.can_select_virtual_machine = true;
            this.can_select_source_location = true;
            this.can_edit_target_location = true;
        } else {
            this.job = {
                id: null,
                name: '',
                schedule_id: null,
                source_retention: null,
                target_retention: null,
                sdc_vm_id: null,
                source_location: null,
                target_location: null,
                zfs_type: 1,
                zfs_size: 1,
                source_host_id:  null,
                target_host_id: null,
                last_execution: null,
                last_schedule: null,
                enabled: false,
                offset: 0
            };
        }
    }

    async node_selected() {
        if (this.selected_source_host === null) {
            this.can_select_virtual_machine = false;
            this.job.source_host_id = null;
            return;
        }
        
        this.job.source_host_id = this.selected_source_host.id;
        this.virtual_machines = await this.virtualMachineService.get_virtual_machines_by_host_id(this.selected_source_host.sdc_id);
        this.can_select_virtual_machine = true;
    }

    async virtual_machine_selected() {
        if (this.job.sdc_vm_id === null) {
            this.job.source_location = null;
            this.can_select_source_location = false;
            this.zfs_filesystems = [];
            this.can_edit_target_location = false;
            this.job.target_location = '';
            this.vm_name = '';
            return;
        }

        this.zfs_filesystems = [];

        const vm_record = await this.virtualMachineService.get_virtual_machine_record(this.selected_source_host.sdc_id, this.job.sdc_vm_id);
        this.vm_name = vm_record.alias;
        this.parse_vm_record(vm_record);

        this.can_select_source_location = true;
    }

    async parse_vm_record(vm_record) {
        //parse the vm api record for the zfs_filesystem strings
        this.vm_brand = vm_record.brand;
        if (vm_record.brand === 'kvm') {
            for(let i = 0; i< vm_record.disks.length; i++) {
                this.zfs_filesystems.push(vm_record.disks[i].zfs_filesystem);
            }
        } else {
            this.zfs_filesystems.push(vm_record.zfs_filesystem);
            for(let i = 0; i < vm_record.datasets.length; i++){
                this.zfs_filesystems.push(vm_record.datasets[i]);
            }
        }
    }

    async source_location_selected() {
        if (this.job.source_location === null) {
            this.can_edit_target_location = false;
            this.job.target_location = '';
            return;
        }

        this.job.target_location = this.job.source_location;
        if (this.vm_brand === 'kvm') {
            const index = this.job.source_location.lastIndexOf('-');
            this.job.name = this.vm_name + '-' + this.job.source_location.substr(index + 1);
        } else {
            const index = this.job.source_location.lastIndexOf('/');
            this.job.name = this.vm_name + '-' + this.job.source_location;
        }
        this.can_edit_target_location = true;
    }

    submit() {
        if (this.job.name === '') {
            return;
        }
        if (this.job.sdc_vm_id == null) {
            return;
        }
        if (this.job.source_location == null || this.job.source_location === 'Dataset/ZVOL') {
            return;
        }
        if (this.job.target_location == null) {
            return;
        }
        if (this.job.source_host_id == null) {
            return;
        }
        if (this.job.target_host_id == null) {
            return;
        }
        const job: Job = {
            id: this.job.id || null,
            name: this.job.name || null,
            schedule_id: this.job.schedule_id || null,
            source_retention: this.job.source_retention || null,
            target_retention: this.job.source_retention || null,
            sdc_vm_id: this.job.sdc_vm_id || null,
            source_location: this.job.source_location || null,
            target_location: this.job.target_location || null,
            zfs_type: this.job.zfs_type || 1,
            zfs_size: this.job.zfs_size || 1,
            source_host_id: this.job.source_host_id || null,
            target_host_id: this.job.target_host_id || null,
            last_execution: null,
            last_schedule: null,
            enabled: this.job.enabled || false,
            offset: this.job.offset || 0
        };

        this.dialogController.ok(job);
    }
}