import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

import {Job} from '../models/job';

@autoinject()
export class JobService {

    constructor(private http: HttpClient) {}

    public async get_jobs(): Promise<Job[]> {
        const res = await this.http.fetch(`jobs`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    async create_job(job: Job): Promise<Job> {
         const body = {
            job: job
        };
        const res = await this.http.fetch(`jobs`, {
            method: 'post',
            body: json(body)
        });
        if (res.status >= 400) {
            throw new Error(await res.json());
        }
        return await res.json();
    }

    public async update_job(id: string, job: Job): Promise<Job> {
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

    public async delete_job(id: string): Promise<any> {
        const res = await this.http.fetch(`jobs/${id}`, {
            method: 'delete'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return null;
    }


}