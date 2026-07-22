export type Role = 'admin' | 'owner' | 'agent' | 'tenant';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    status: UserStatus;
}

export interface LoginResponse {
    token: string;
    user: User;
}