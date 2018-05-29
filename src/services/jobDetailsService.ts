import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class JobDetailsService {
    constructor(private http: HttpClient) {}

    public async getAllJobDetails(gridParams: any) {
        const query = [];

        const query_string = query.join('&');
        const res = await this.http.fetch(`job_details`, {
            method: 'post',
            body: json(gridParams)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}