export interface Host {
    id: string;
    name: string;
    sdc_id: string;
    ip_address: string;
    port: number;
    max_total_jobs: number;
    max_backup_jobs: number;
    max_retention_jobs: number;
}