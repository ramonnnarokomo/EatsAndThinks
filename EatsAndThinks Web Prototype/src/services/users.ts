import api from "./api";

export interface UserData {
  id: number;
  nombre: string;
  email: string;
  role: string;
  createdAt: string;
  totalReviews: number;
  avgRating: number;
}

export interface UpdateUserData {
  nombre?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function getCurrentUser(): Promise<UserData> {
  const res = await api.get('/users/me');
  return res.data;
}

export async function updateUser(data: { nombre?: string; email?: string }): Promise<any> {
  const res = await api.put('/users/me', data);
  return res.data; // 🔥 Devolvemos la respuesta completa para acceder a emailChanged
}

export async function getUserReviews() {
  const res = await api.get('/users/me/reviews');
  return res.data;
}
