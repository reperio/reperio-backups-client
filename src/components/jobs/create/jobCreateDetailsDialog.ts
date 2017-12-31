import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

import {Host} from '../../../models/host';
import {HostService} from '../../../services/hostService';
import {Job} from '../../../models/job';
import {VirtualMachine} from '../../../models/virtualMachine';
import {VirtualMachineService} from '../../../services/virtualMachineService';

@autoinject()
export class JobCreateDetailsDialog {
    public can_select_virtual_machine: boolean;
    public can_select_source_location: boolean;
    public can_edit_target_location: boolean;

    public job_name: string;
    public hosts: Host[];
    public selected_source_host: Host;
    public selected_target_host: Host;
    public selected_virtual_machine: VirtualMachine;
    public selected_source_location: string;
    public selected_target_location: string;
    public virtual_machines: any[];
    public zfs_filesystems: string[] = [];
    

    constructor(private dialogController: DialogController, private hostService: HostService, private virtualMachineService: VirtualMachineService) { }

    async activate() {
        this.hosts = await this.hostService.get_hosts();
    }

    async node_selected() {
        if (this.selected_source_host === null) {
            this.can_select_virtual_machine = false;
            return;
        }
        
        this.virtual_machines = await this.virtualMachineService.get_virtual_machines_by_host_id(this.selected_source_host.sdc_id);
        this.can_select_virtual_machine = true;
    }

    async virtual_machine_selected() {
        if (this.selected_virtual_machine === null) {
            this.selected_source_location = null;
            this.can_select_source_location = false;
            this.zfs_filesystems = [];
            this.can_edit_target_location = false;
            this.selected_target_location = '';
            return;
        }

        const vm_record = await this.virtualMachineService.get_virtual_machine_record(this.selected_source_host.sdc_id, this.selected_virtual_machine.sdc_id);

        //parse the vm api record for the zfs_filesystem strings
        if (vm_record.brand === 'kvm') {
            this.zfs_filesystems.push(vm_record.zfs_filesystem);
            for(let i = 0; i< vm_record.disks.length; i++) {
                this.zfs_filesystems.push(vm_record.disks[i].zfs_filesystem);
            }
        } else {
            this.zfs_filesystems.push(vm_record.zfs_filesystem);
        }

        console.log(this.zfs_filesystems);

        this.can_select_source_location = true;
    }

    async source_location_selected() {
        if (this.selected_source_location === null) {
            this.can_edit_target_location = false;
            this.selected_target_location = '';
            return;
        }

        this.selected_target_location = this.selected_source_location;
        this.can_edit_target_location = true;
    }

    submit() {
        if (this.job_name === '') {
            return;
        }
        if (this.selected_virtual_machine == null) {
            return;
        }
        if (this.selected_source_location == null) {
            return;
        }
        if (this.selected_target_location == null) {
            return;
        }
        if (this.selected_source_host == null) {
            return;
        }
        if (this.selected_target_host == null) {
            return;
        }

        const job: Job = {
            id: null,
            name: this.job_name,
            schedule_id: null,
            source_retention: null,
            target_retention: null,
            sdc_vm_id: this.selected_virtual_machine.sdc_id,
            source_location: this.selected_source_location,
            target_location: this.selected_target_location,
            zfs_type: null,
            zfs_size: null,
            source_host_id: this.selected_source_host.sdc_id,
            target_host_id: this.selected_target_host.sdc_id,
            last_execution: null,
            last_schedule: null,
            enabled: null,
            offset: 0
        };

        this.dialogController.ok(job);
    }
}