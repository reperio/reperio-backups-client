import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

@autoinject()
export class DashboardService {
    constructor(private http: HttpClient){ }

    public async getDashboardData(): Promise<any>{
        const res = await this.http.fetch('dashboard', {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}