import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

@autoinject()
export class JobHistoryService {
    constructor (private http: HttpClient) { }

    public async getJobHistories(selected_host:string, selected_virtual_machine: string): Promise<any> {
        const query = [];
        if (selected_host) {
            query.push(`host_id=${selected_host}`);
        }

        if (selected_virtual_machine) {
            query.push(`virtual_machine_id=${selected_virtual_machine}`);
        }

        const query_string = query.join('&');
        const res = await this.http.fetch(`job_histories?${query}`, {
            method: 'get',
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}