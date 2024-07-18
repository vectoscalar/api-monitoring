export interface InvocationFilter {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    ipAddress?: string;
}

export interface AvergaResponseFilter {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export enum PERIOD_FILTER {
    'DAILY' = 'daily',
    'WEEKLY' = 'weekly',
    'MONTHLY' = 'monthly',
    'YEARLY' = 'yearly',
}