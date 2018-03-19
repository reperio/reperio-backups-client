import {autoinject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

import {VirtualMachineDataset} from '../models/virtual_machine_dataset';

@autoinject()
export class VirtualMachineDatasetService {
    constructor(private http: HttpClient) {}

    public async get_datasets_by_virtual_machine_id(host_id: string, vm_id: string): Promise<VirtualMachineDataset[]> {
        const res = await  this.http.fetch(`hosts/${host_id}/virtual_machines/${vm_id}/datasets`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async toggle_dataset_enabled_status(dataset: any): Promise<any>{
        const body = {
            dataset: dataset
        };
        const res = await this.http.fetch(`datasets`, {
            method: 'put',
            body: json(body)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}