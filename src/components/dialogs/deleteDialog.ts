import {autoinject, bindable} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import {Router} from 'aurelia-router';

@autoinject()
export class DeleteDialog {
    public message: string;
    
    constructor(private dialogController: DialogController) { }

    async activate(message: string) {
        this.message = message;
    }
}