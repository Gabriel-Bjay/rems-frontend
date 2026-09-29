export type Role = 'admin' | 'owner' | 'agent' | 'tenant';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    status: UserStatus;
}

export interface LoginResponse {
    token: string;
    user: User;
}

/** A demo login the API offers while its public demo is switched on. */
export interface DemoAccount {
    role: Exclude<Role, 'admin'>;
    name: string;
}