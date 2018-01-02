import {autoinject, observable} from 'aurelia-framework';

import {JobHistoryService} from '../../services/jobHistoryService';
import {HostService} from '../../services/hostService';
import {VirtualMachineService} from '../../services/virtualMachineService';
import {Host} from '../../models/host';
import {VirtualMachine} from '../../models/virtual_machine';

@autoinject()
export class JobHistoryView {
    public hosts: Host[];
    public virtual_machines: VirtualMachine[];
    public pageSize: number = 5;

    @observable({ changeHandler: 'selected_host_changed' }) public selected_host;
    @observable({ changeHandler: 'filter_changed' }) public filter;

    constructor(private jobHistoryService: JobHistoryService, private hostService: HostService, private virtualMachineService: VirtualMachineService) {}

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
            vm.last_execution = this.get_virtual_machine_last_backup_date(vm);
        });
        
        virtual_machines.sort((a, b) => {
            return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });

        this.virtual_machines = virtual_machines;
    }

    get_virtual_machine_status(vm) {

    }

    get_virtual_machine_last_backup_date(vm) {
        const dates = vm.virtual_machine_jobs.map((job) => {
            return job.last_execution;
        }).sort();

        return dates.pop();
    }
}