import {autoinject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';

import {Host} from '../models/host';

@autoinject()
export class HostService {
    constructor(private http: HttpClient) { }

    public async get_hosts(): Promise<Host[]> {
        const res = await this.http.fetch(`hosts`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}