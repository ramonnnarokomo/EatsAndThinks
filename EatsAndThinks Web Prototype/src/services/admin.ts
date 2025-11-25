import api from "./api";

export interface AdminUser {
  id: number;
  nombre: string;
  email: string;
  role: string;
  banned: boolean;
  canReview: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  totalLocals: number;
  adminCount: number;
  bannedUsers: number;
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const res = await api.get('/admin/users');
  return res.data;
}

export async function changeUserRole(userId: number, role: string) {
  const res = await api.put(`/admin/users/${userId}/role`, { role });
  return res.data;
}

export async function toggleBanUser(userId: number, banned: boolean) {
  const res = await api.put(`/admin/users/${userId}/ban`, { banned });
  return res.data;
}

export async function toggleReviewPermission(userId: number, canReview: boolean) {
  const res = await api.put(`/admin/users/${userId}/review-permission`, { canReview });
  return res.data;
}

export async function deleteUser(userId: number) {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
}

export async function createLocal(data: {
  placeId?: string;
  nombre: string;
  direccion: string;
  tipo: string;
  lat: number;
  lng: number;
  priceLevel?: number;
  photoRef?: string;
}) {
  const res = await api.post('/admin/locals', data);
  return res.data;
}

export async function getSystemStats(): Promise<SystemStats> {
  const res = await api.get('/admin/stats');
  return res.data;
}

