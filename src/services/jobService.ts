import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

@autoinject()
export class JobService {

    constructor(private http: HttpClient) {}

    public async getJobs(): Promise<any> {
        const res = await this.http.fetch('jobs', {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}