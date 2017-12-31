export interface VirtualMachine {
    id: string;
    name: string;
    enabled: boolean;
    status: string;
    host_id: string;
    state: string;
    sdc_id: string;
}