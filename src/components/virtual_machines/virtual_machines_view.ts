import {autoinject, observable} from 'aurelia-framework';
import * as _ from 'lodash';

import {JobHistoryService} from '../../services/jobHistoryService';
import {HostService} from '../../services/hostService';
import {VirtualMachineService} from '../../services/virtualMachineService';
import {Host} from '../../models/host';
import {VirtualMachine} from '../../models/virtual_machine';
import {VirtualMachineDatasetService} from '../../services/virtualMachineDatasetService';

@autoinject()
export class JobHistoryView {
    public hosts: Host[];
    public virtual_machines: VirtualMachine[];
    public pageSize: number = 5;

    @observable({ changeHandler: 'selected_host_changed' }) public selected_host;
    @observable({ changeHandler: 'filter_changed' }) public filter;

    constructor(private jobHistoryService: JobHistoryService, private hostService: HostService, private virtualMachineDatasetService: VirtualMachineDatasetService, private virtualMachineService: VirtualMachineService) {}

    selected_host_changed(new_value, old_value) {
        console.log(`host changed: ${new_value}`);

        this.load_virtual_machines();
    }

    filter_changed(new_value, old_value) {
        console.log(`filter changed: ${new_value}`);

        this.load_virtual_machines();
    }

    async bind() {
        const virtual_machines_promise = this.load_virtual_machines();
        const hosts_promise = this.load_hosts();

        await virtual_machines_promise;
        await hosts_promise;
    }

    async load_hosts() {
        this.hosts = await this.hostService.get_hosts();
    }

    async load_virtual_machines() {
        const virtual_machines = await this.virtualMachineService.getVirtualMachines(this.selected_host, this.filter);

        virtual_machines.forEach((vm) => {
            vm.expanded = false;
        });
        
        virtual_machines.sort((a, b) => {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
        });

        this.virtual_machines = virtual_machines;
    }

    async virtual_machine_toggle_expanded_status(vm_id, expand?: boolean) {
        let virtual_machine: any = _.find(this.virtual_machines, vm => {
            return vm_id === vm.id;
        });

        if (virtual_machine.expanded) {
            virtual_machine.expanded = false;
        } else {
            await this.expand_vm(virtual_machine.id);
        }
    }

    async toggle_dataset_enabled_status(dataset: any, vm_id: string) {
        await this.virtualMachineDatasetService.toggle_dataset_enabled_status(dataset);
        await this.expand_vm(vm_id);
        const vm = await this.virtualMachineService.get_virtual_machine_by_id(vm_id);
        console.log(vm.status);
        let virtual_machine: any = _.find(this.virtual_machines, virtual_machine => {
            return  virtual_machine.id === vm_id;
        });
        virtual_machine.status = vm.status;
    }

    async expand_vm(vm_id: string) {
        const vm: any = _.find(this.virtual_machines, virtual_machine => {
            return  virtual_machine.id === vm_id;
        });
        vm.expanded = true;
        vm.datasets = await this.get_vm_datasets(vm);
    }
    
    async get_vm_datasets(virtual_machine) {
        return await this.virtualMachineDatasetService.get_datasets_by_virtual_machine_id(virtual_machine.host_id, virtual_machine.id);
    }
}