import {autoinject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

import {Schedule} from '../models/schedule';

@autoinject()
export class ScheduleService {
    constructor(private http: HttpClient) { }

    public async get_schedules(): Promise<Schedule[]> {
        const res = await this.http.fetch(`schedules`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}