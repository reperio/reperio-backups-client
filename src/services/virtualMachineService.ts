import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

import {VirtualMachine} from '../models/virtual_machine';

@autoinject()
export class VirtualMachineService {
    constructor(private http: HttpClient) {}

    public async get_virtual_machines_by_host_id(id: string): Promise<VirtualMachine[]> {
        const res = await this.http.fetch(`hosts/${id}/virtual_machines`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async get_virtual_machine_record(host_id: string, vm_id: string): Promise<any>{
        const res = await this.http.fetch(`hosts/${host_id}/virtual_machines/${vm_id}/vm_api_record`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async getVirtualMachines(selected_host:string, filter:string): Promise<any> {
        const query = [];
        if (selected_host) {
            query.push(`host_id=${selected_host}`);
        }

        if (filter) {
            query.push(`filter=${filter}`);
        }

        const query_string = query.join('&');
        const res = await this.http.fetch(`virtual_machines?${query_string}`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}