import { StringLiteral } from "typescript";

export interface VirtualMachineDataset {
    location: string;
    name: string;
    virtual_machine_id: string;
    enabled: boolean;
    type: string;
}