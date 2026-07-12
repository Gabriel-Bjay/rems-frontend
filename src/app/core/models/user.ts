export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'agent' | 'tenant';
    status: 'pending' | 'active' | 'suspended';
}

export interface LoginResponse {
    token: string;
    user: User;
}