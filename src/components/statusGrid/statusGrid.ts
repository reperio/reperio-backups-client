import {autoinject} from 'aurelia-framework';

@autoinject()
export class StatusGrid {
    
    public nodes: any;
    
    constructor(){ 
        this.nodes = [
            {
                hostname: "headnode",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.1",
                datacenter: "Datacenter 1",
                num_virtual_machines: 0,
                total_ram: 100000000,
                used_ram: 43000000,
                total_disk: 159987531776,
                used_disk: 9800000000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.2",
                datacenter: "Datacenter 1",
                num_virtual_machines: 10,
                total_ram: 100000000,
                used_ram: 55000000,
                total_disk: 159987531776,
                used_disk: 95005500000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.3",
                datacenter: "Datacenter 1",
                num_virtual_machines: 3,
                total_ram: 100000000,
                used_ram: 66000000,
                total_disk: 159987531776,
                used_disk: 99000000000,
                status: 'bad'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.4",
                datacenter: "Datacenter 1",
                num_virtual_machines: 6,
                total_ram: 100000000,
                used_ram: 22000000,
                total_disk: 159987531776,
                used_disk: 95000000000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.5",
                datacenter: "Datacenter 1",
                num_virtual_machines: 23,
                total_ram: 100000000,
                used_ram: 65000000,
                total_disk: 159987531776,
                used_disk: 45000000000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.6",
                datacenter: "Datacenter 2",
                num_virtual_machines: 8,
                total_ram: 100000000,
                used_ram: 98000000,
                total_disk: 159987531776,
                used_disk: 15000000000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.7",
                datacenter: "Datacenter 2",
                num_virtual_machines: 4,
                total_ram: 100000000,
                used_ram: 11000000,
                total_disk: 159987531776,
                used_disk: 150000000000,
                status: 'good'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.8",
                datacenter: "Datacenter 2",
                num_virtual_machines: 13,
                total_ram: 100000000,
                used_ram: 34000000,
                total_disk: 159987531776,
                used_disk: 66000000000,
                status: 'warning'
            }, {
                hostname: "Compute Node",
                uuid: "564d4374-d703-b97b-ca9f-7375f05f337c",
                ip_address: "127.0.0.9",
                datacenter: "Datacenter 2",
                num_virtual_machines: 14,
                total_ram: 100000000,
                used_ram: 56000000,
                total_disk: 159987531776,
                used_disk: 45000000000,
                status: 'bad'
            }
        ];
    }


}