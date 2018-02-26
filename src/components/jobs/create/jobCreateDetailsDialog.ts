import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

import * as _ from 'lodash';

import { Host } from '../../../models/host';
import { HostService } from '../../../services/hostService';
import { Job } from '../../../models/job';
import { VirtualMachine } from '../../../models/virtual_machine';
import { VirtualMachineService } from '../../../services/virtualMachineService';
import { VirtualMachineDataset } from '../../../models/virtual_machine_dataset';
import { VirtualMachineDatasetService } from '../../../services/virtualMachineDatasetService';

@autoinject()
export class JobCreateDetailsDialog {
    public can_select_virtual_machine: boolean;
    public can_select_source_location: boolean;
    public can_edit_target_location: boolean;

    public job: Job;
    public hosts: Host[];
    public selected_source_host: Host;
    public virtual_machines: VirtualMachine[];
    public vm_brand: string;
    public vm_name: string;
    public datasets: VirtualMachineDataset[] = [];
    public formState: any = {
        source_node: false,
        virtual_machine: false,
        target_node: false,
        dataset: false,
        job_name: false
    };
    public canContinue: boolean = false;

    constructor(private dialogController: DialogController, private hostService: HostService, private virtualMachineDatasetService: VirtualMachineDatasetService, private virtualMachineService: VirtualMachineService) { }

    async activate(job) {
        this.hosts = await this.hostService.get_hosts();

        if (job !== null) {
            this.selected_source_host = _.find(this.hosts, host => {
                return host.id === job.source_host_id;
            });

            this.virtual_machines = await this.virtualMachineService.get_virtual_machines_by_host_id(this.selected_source_host.sdc_id);
            this.datasets = await this.virtualMachineDatasetService.get_datasets_by_virtual_machine_id(job.source_host_id, job.sdc_vm_id);
            this.job = job;
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
                source_host_id: null,
                target_host_id: null,
                last_execution: null,
                last_schedule: null,
                enabled: false,
                offset: 0
            };
        }

        this.validateForm();
    }

    async node_selected() {
        if (this.selected_source_host === null) {
            this.can_select_virtual_machine = false;
            this.job.sdc_vm_id = null,
            this.job.source_host_id = null;
            this.job.name = null;
            this.job.source_location = null;
            this.validateForm();
            return;
        }

        if (this.selected_source_host.id != this.job.source_host_id) {
            this.job.sdc_vm_id = null;
            this.job.name = null;
            this.job.source_location = null;
        }

        this.job.source_host_id = this.selected_source_host.id;
        this.virtual_machines = await this.virtualMachineService.get_virtual_machines_by_host_id(this.selected_source_host.sdc_id);
        this.can_select_virtual_machine = true;
        this.validateForm();
    }

    async virtual_machine_selected() {
        this.datasets = [];

        this.job.source_location = null;
        this.job.name = null;

        if (this.job.sdc_vm_id === null) {
            this.job.source_location = null;
            this.can_select_source_location = false;
            this.can_edit_target_location = false;
            this.job.target_location = '';
            this.vm_name = '';
            this.job.name = '';
            this.validateForm();
            return;
        }

        this.datasets = await this.virtualMachineDatasetService.get_datasets_by_virtual_machine_id(this.job.source_host_id, this.job.sdc_vm_id);
        console.log(JSON.stringify(this.datasets));
        const vm = _.find(this.virtual_machines, virtual_machine => {
            return virtual_machine.id === this.job.sdc_vm_id;
        });
        this.vm_name = vm.name;
        this.can_select_source_location = true;
        this.validateForm();
    }

    async source_location_selected() {

        if (this.job.source_location === null) {
            this.can_edit_target_location = false;
            this.job.target_location = '';
            this.job.name = '';
            this.validateForm();
            return;
        }

        const selected_dataset = _.find(this.datasets, dataset => {
            return this.job.source_location === dataset.location;
        })

        this.job.target_location = this.job.source_location;
        this.job.name = this.vm_name + '-' + selected_dataset.name;
        this.can_edit_target_location = true;
        this.validateForm();
    }

    submit() {
        if (!this.validateForm()) {
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

    validateForm() {
        let error = false;
        if (this.job.source_host_id === null) {
            error = true;
            this.formState.source_node = false;
        } else {
            this.formState.source_node = true;
        }
        if (this.job.sdc_vm_id === null) {
            error = true;
            this.formState.virtual_machine = false;
        } else {
            this.formState.virtual_machine = true;
        }
        if (this.job.target_host_id === null) {
            error = true;
            this.formState.target_node = false;
        } else {
            this.formState.target_node = true;
        }
        if (this.job.source_location === null) {
            error = true;
            this.formState.dataset = false;
        } else {
            this.formState.dataset = true;
        }
        if (this.job.name === null || !this.job.name || !this.job.name.trim()) {
            error = true;
            this.formState.job_name = false;
        } else {
            this.formState.job_name = true;
        }

        console.log(JSON.stringify(this.formState));

        this.canContinue = !error;
        return !error;
    }
}