import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

@autoinject()
export class DatasetService {
    constructor(private http: HttpClient){ }

    public async getDashboardData(id: string): Promise<any>{
        const res = await this.http.fetch(`datasets/${id}`, {
            method: 'put'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}