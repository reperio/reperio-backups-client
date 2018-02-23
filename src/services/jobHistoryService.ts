import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

@autoinject()
export class JobHistoryService {
    constructor (private http: HttpClient) { }

    public async getJobHistories(gridParams: any): Promise<any> {
        const query = [];

        const query_string = query.join('&');
        const res = await this.http.fetch(`job_histories`, {
            method: 'post',
            body: json(gridParams)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}