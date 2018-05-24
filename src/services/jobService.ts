import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';
import { Job } from '../models/job';


@autoinject()
export class JobService {

    constructor(private http: HttpClient) {}

    public async get_jobs(gridParams: any): Promise<Job[]> {
        const query = [];

        const query_string = query.join('&');
        const res = await this.http.fetch(`jobs/all`, {
            method: 'post',
            body: json(gridParams)
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