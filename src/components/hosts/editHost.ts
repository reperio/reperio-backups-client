import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import * as toastr from 'toastr';

import {Host} from '../../models/host';
import {HostService} from '../../services/hostService';

@autoinject()
export class EditHostDialog {
    public host_id: string;
    public host: Host = null;
    public formState: any = {};

    constructor(private dialogController: DialogController, private hostService: HostService) { }

    async activate(host_id: string) {
        if (host_id != null) {
            this.host = await this.hostService.get_host_by_id(host_id);
            this.host_id = host_id;
        } else {
            this.host = {
                id: null,
                name: '',
                ip_address: '',
                port: await this.hostService.get_default_host_port(),
                sdc_id: null
            }
        }

        this.validateForm();
    }

    async submit(){
        if (this.host.id == null) {
            // create host
            try {
                await this.hostService.create_host(this.host);
                toastr.success('Host created successfully');
            } catch (err) {
                toastr.error('Failed to create host');
            }
            this.dialogController.ok();
        } else {
            // edit host
            try {
                this.hostService.update_host(this.host_id, this.host);
                toastr.success('Updated host successfully');
            } catch (err) {
                toastr.error('Failed to update host');
            }
            this.dialogController.ok();
        }
    }

    validateForm() {
        this.formState.validState = true;
        if (this.host.name == null || !this.host.name.trim()) {
            this.formState.hostname = false;
            this.formState.validState = false;
        } else {
            this.formState.hostname = true;
        }

        if (this.host.ip_address == null || !this.host.ip_address.trim()) {
            this.formState.ip_address = false;
            this.formState.validState = false;
        } else {
            this.formState.ip_address = true;
        }

        if (this.host.port == null || this.host.port.toString() == '' || this.host.port < 0 || this.host.port > 65535) {
            this.formState.port = false;
            this.formState.validState = false;
        } else {
            this.formState.port = true;
        }
    }
}