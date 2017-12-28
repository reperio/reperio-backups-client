import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

import {Job} from '../models/job';

@autoinject()
export class JobService {

    constructor(private http: HttpClient) {}

    public async get_jobs(node_id: string, order_by: string, order_direction: string): Promise<Job[]> {
        const res = await this.http.fetch(`jobs?node_id=${node_id}&order_by=${order_by}&order_direction=${order_direction}`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async update_job(id: number, job: Job): Promise<Job> {
        const body = {
            job: job
        };
        const res = await this.http.fetch(`jobs/${id}`, {
            method: 'put',
            body: json(body)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }


}