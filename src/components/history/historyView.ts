import {autoinject, observable} from 'aurelia-framework';

import {JobHistoryService} from '../../services/jobHistoryService';
import {HostService} from '../../services/hostService';
import {VirtualMachineService} from '../../services/virtualMachineService';
import {Host} from '../../models/host';
import {VirtualMachine} from '../../models/virtual_machine';

@autoinject()
export class JobHistoryView {

    public history_entries: any[];
    public hosts: Host[];
    public virtual_machines: VirtualMachine[];
    public pageSize: number = 50;

    @observable({ changeHandler: 'selected_host_changed' }) public selected_host;
    @observable({ changeHandler: 'selected_virtual_machine_changed' }) public selected_virtual_machine;

    constructor(private jobHistoryService: JobHistoryService, private hostService: HostService, private virtualMachineService: VirtualMachineService) {}

    selected_host_changed(new_value, old_value) {
        console.log('host changed');
        console.log(new_value);
        this.load_history_entries();
        this.load_virtual_machines();
    }

    selected_virtual_machine_changed(new_value, old_value) {
        console.log('vm changed');
        console.log(new_value);
        this.load_history_entries();
    }

    async bind() {
        const history_promise = this.load_history_entries();
        const hosts_promise = this.load_hosts();

        await history_promise;
        await hosts_promise;
    }

    async load_history_entries() {
        const history_entries = await this.jobHistoryService.getJobHistories(this.selected_host, this.selected_virtual_machine);

        history_entries.forEach((entry) => {
            if (entry.source_result === 0) {
                entry.source_result_name = 'Pending';
            } else if (entry.source_result === 1) {
                entry.source_result_name = 'Active';
            } else if (entry.source_result === 2) {
                entry.source_result_name = 'Success';
            } else if (entry.source_result === 3) {
                entry.source_result_name = 'Failed';
            } else {
                entry.source_result_name = 'Unknown';
            }
        });

        this.history_entries = history_entries;
    }

    async load_hosts() {
        this.hosts = await this.hostService.get_hosts();
    }

    async load_virtual_machines() {
        this.virtual_machines = await this.virtualMachineService.getVirtualMachines(this.selected_host, null);
    }
}
