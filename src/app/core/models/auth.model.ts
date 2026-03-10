import { User } from './user.model';

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  skills: string[];
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

