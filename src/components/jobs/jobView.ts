import {autoinject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import * as toastr from 'toastr';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {Host} from '../../models/host';
import {HostService} from '../../services/hostService';
import {Job} from '../../models/job';
import {JobService} from '../../services/jobService';
import {DeleteDialog} from '../dialogs/deleteDialog';
import {JobCreateDetailsDialog} from './create/jobCreateDetailsDialog';
import {JobCreateRetentionDialog} from './create/jobCreateRetentionDialog';
import {JobEditDialog} from './edit/jobEditDialog';
import {JobScheduleDialog} from './create/jobCreateScheduleDialog';
import {VirtualMachine} from '../../models/virtual_machine';
import {VirtualMachineService} from '../../services/virtualMachineService';

@autoinject()
export class JobView {
    public jobs: Job[];
    public hosts: Host[];
    public filtered_virtual_machines: VirtualMachine[];
    public virtual_machines: VirtualMachine[];
    public selected_host: Host;
    public table: any;
    public $displayData: any[];

    public filters: any[] = [
        { value: '', keys: ['job_source_host.id'] },
        { value: '', keys: ['job_virtual_machine.id'] }
    ];

    constructor(private dialogService: DialogService, private jobService: JobService, private hostService: HostService, private virtualMachineService: VirtualMachineService) { }

    async bind() {
        await this.load_jobs();
        this.hosts = await this.hostService.get_hosts();
        this.virtual_machines = await this.virtualMachineService.getVirtualMachines();
        this.filtered_virtual_machines = this.virtual_machines;
        

        //data.bind: jobs; display-data.bind: $displayData; filters.bind: filters
    }

    async attached() {
        console.log(this.table);
    }

    async load_jobs() {
        this.jobs = await this.jobService.get_jobs();
    }

    async update_job_enabled_status(id: string, job: Job) {
        await this.jobService.update_job(id, job);
        await this.load_jobs();
    }

    async update_selected_host() {
        this.hosts.forEach(host => {
            if (host.id === this.filters[0].value) this.selected_host = host;
        });
        this.filters[1].value = '';
        console.log(JSON.stringify(this.filters[0].value));
        if (this.selected_host === null || typeof this.selected_host === 'undefined') {
            console.log('no filter');
            this.filtered_virtual_machines = this.virtual_machines;
        } else {
            console.log('filter');
            this.filtered_virtual_machines = this.virtual_machines.filter(vm => {
                return vm.host_id === this.selected_host.sdc_id;
            });
        }

        this.filtered_virtual_machines.sort((a, b) => {
            const a_value = a.name == '' ? a.id.toUpperCase() : a.name.toUpperCase();
            const b_value = b.name == '' ? b.id.toUpperCase() : b.name.toUpperCase();

            return a_value < b_value ? -1 : 1;
        });
    }

    update_sort_column() {
        console.log(this.table);
        if (this.filters[1].value !== ''){
            this.table.sortKey = 'name';
            $('#vm_header').removeClass('aut-asc');
            $('#vm_header').removeClass('aut-desc');
            $('#vm_header').addClass('aut-sortable');
            $('#job_header').addClass('aut-asc');
        } else {
            $('#job_header').removeClass('aut-asc');
            $('#job_header').removeClass('aut-desc');
            $('#job_header').addClass('aut-sortable');
            $('#vm_header').addClass('aut-asc');
            this.table.sortKey = 'job_virtual_machine.name';
        }
        this.table.doSort(this.$displayData);
    }

    async edit_job(job){
        this.dialogService.open({viewModel: JobEditDialog, model: $.extend( {}, job), lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                const updated_job = response.output;
                await this.jobService.update_job(updated_job.id, updated_job);
                toastr.success('Job updated');
                await this.load_jobs();
            }
        });
    }

    async delete_job(id: string) {
        this.dialogService.open({viewModel: DeleteDialog, model: 'Are you sure you want to delete this job?', lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                await this.jobService.delete_job(id);
                await this.load_jobs();
            }
        });
    }

    async create_job(step_number: number, job: Job) {
       if(step_number === 1) {
           this.open_job_details_modal(job);
       } else if (step_number === 2) {
           this.open_job_schedule_modal(job);
       } else if (step_number === 3) {
           this.open_job_retention_modal(job);
       }
    }

    async open_job_details_modal(job) {
        this.dialogService.open({viewModel: JobCreateDetailsDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                return this.create_job(2, response.output);
            }
            return null;
        });
    }

    async open_job_schedule_modal(job) {
        this.dialogService.open({viewModel: JobScheduleDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                return this.create_job(3, response.output);
            }
            return this.create_job(1, response.output);
        });
    }

    async open_job_retention_modal(job) {
        this.dialogService.open({viewModel: JobCreateRetentionDialog, model: job, lock: false}).whenClosed(async (response) => {
            if (!response.wasCancelled) {
                await this.load_jobs();
                toastr.success(`Job "${response.output.name}" was created successfully`);
                return;
            }
            return this.create_job(2, response.output);
        });
    }
}