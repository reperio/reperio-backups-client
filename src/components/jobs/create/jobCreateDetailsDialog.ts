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
import {JobValidationService} from '../../../services/jobValidationService';

@autoinject()
export class JobCreateDetailsDialog {
    public can_select_virtual_machine: boolean;
    public can_select_source_location: boolean;
    public can_edit_target_location: boolean;

    public job: Job;
    public hosts: Host[];
    public selected_source_host: Host;
    public virtual_machines: VirtualMachine[];
    public datasets: VirtualMachineDataset[] = [];
    public formState: any = null;

    constructor(private dialogController: DialogController, private hostService: HostService, private jobValidationService: JobValidationService, private virtualMachineDatasetService: VirtualMachineDatasetService, private virtualMachineService: VirtualMachineService) { }

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
            this.job.name = '';
            this.validateForm();
            return;
        }

        this.datasets = await this.virtualMachineDatasetService.get_datasets_by_virtual_machine_id(this.job.source_host_id, this.job.sdc_vm_id);
        const vm = _.find(this.virtual_machines, virtual_machine => {
            return virtual_machine.id === this.job.sdc_vm_id;
        });
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
        
        const virtual_machine = _.find(this.virtual_machines, virtual_machine => {
            return this.job.sdc_vm_id === virtual_machine.id;
        });

        this.job.name = this.generate_job_name(virtual_machine.name, virtual_machine.type, selected_dataset.name, selected_dataset.type);
        this.can_edit_target_location = true;
        this.validateForm();
    }

    submit() {
        if (!this.formState.is_valid_state) {
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

    async validateForm() {
        this.formState = await this.jobValidationService.validate_job_details(this.job);
        return this.formState.is_valid_state;
    }

    generate_job_name(vm_name: string, vm_type: string, dataset_name: string, dataset_type: string) {
        if (vm_type === 'kvm') {
            if (dataset_type === 'zvol') {
                if (dataset_name === 'disk0') {
                    return vm_name;
                } else {
                    return vm_name + '-' + dataset_name;
                }
            } else {
                return vm_name + '-zfs-root';
            }
        } else {
            if (dataset_type === 'root') {
                return vm_name;
            } else {
                return vm_name + '-' + dataset_name;
            }
        }
    }
}