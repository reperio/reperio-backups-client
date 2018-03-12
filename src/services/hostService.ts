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

    public async get_host_by_id(host_id: string): Promise<Host> {
        const res = await this.http.fetch(`hosts/${host_id}`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async create_host(host: Host): Promise<any> {
        const body = {
            host: host
        };
        const res = await this.http.fetch(`hosts`, {
            method: 'post',
            body: json(body)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async update_host(host_id: string, host: Host): Promise<any> {
        const body = {
            host: host
        };
        const res = await this.http.fetch(`hosts/${host_id}`, {
            method: 'put',
            body: json(body)
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async delete_host_by_id(host_id: string): Promise<any> {
        const res = await this.http.fetch(`hosts/${host_id}`, {
            method: 'delete'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }

    public async get_default_host_port(): Promise<number> {
        const res = await this.http.fetch(`hosts/default_port`, {
            method: 'get'
        });
        if (res.status >= 400) {
            throw new Error(`Status code ${res.status}`);
        }
        return await res.json();
    }
}