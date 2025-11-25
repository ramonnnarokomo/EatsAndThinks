import api from "./api";

export interface FavoritePlace {
  id: number;
  placeId: string;
  name: string;
  address: string;
  rating: number;
  totalRatings: number;
  priceLevel: number;
  type: string;
  photoRef: string;
}

export async function getFavorites(): Promise<FavoritePlace[]> {
  const res = await api.get('/favorites');
  return res.data.map((fav: any) => ({
    id: fav.id,
    placeId: fav.local.placeId,
    name: fav.local.name,
    address: fav.local.address,
    rating: fav.local.rating,
    totalRatings: fav.local.totalRatings,
    priceLevel: fav.local.priceLevel,
    type: fav.local.type,
    photoRef: fav.local.photoRef
  }));
}

export async function addFavorite(placeId: string) {
  const res = await api.post('/favorites', { placeId });
  return res.data;
}

export async function removeFavorite(placeId: string) {
  await api.delete(`/favorites/${placeId}`);
}

export async function checkFavorite(placeId: string): Promise<boolean> {
  try {
    const res = await api.get(`/favorites/check/${placeId}`);
    return res.data.isFavorite;
  } catch {
    return false;
  }
}
