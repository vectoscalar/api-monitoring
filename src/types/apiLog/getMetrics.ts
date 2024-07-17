export interface InvocationFilter {
    endpointId?: string;
    microserviceId?: string;
    projectId?: string;
    organizationId?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    ipAddress?: string;
}

export interface AvergaResponseFilter {
    endpointId?: string;
    microserviceId?: string;
    projectId?: string;
    organizationId?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export enum PERIOD_FILTER {
    'DAILY' = 'daily',
    'WEEKLY' = 'weekly',
    'MONTHLY' = 'monthly',
    'YEARLY' = 'yearly',
}