// src/services/auth.ts
import api from "./api";

export interface AuthResponse {
  message: string;
  jwtToken: string;
  email?: string;
  role?: string;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password });
  return res.data as AuthResponse;
}

export async function apiRegister(nombre: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api.post("/auth/register", { nombre, email, password });
  return res.data as AuthResponse;
}

export async function apiGuestLogin(): Promise<AuthResponse> {
  const res = await api.post("/auth/guest");
  return res.data as AuthResponse;
}