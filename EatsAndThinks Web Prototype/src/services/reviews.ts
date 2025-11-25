// src/services/reviews.ts
import api from "./api";

export interface ReviewDto {
  reviewId?: number;
  placeId: string | number;
  author?: string;
  puntuacion: number;
  comentario: string;
  fecha?: string;
  restaurantName?: string;
}

export async function getReviewsByPlace(placeId: string | number) {
  const res = await api.get(`/locales/${placeId}/reviews`);
  return res.data as ReviewDto[];
}

export async function postReview(review: { 
  placeId: string | number; 
  puntuacion: number; 
  comentario: string;
  localData: {
    placeId: string;
    nombre: string;
    direccion: string;
    tipo: string;
    lat: number;
    lng: number;
    priceLevel?: number;
    photoRef?: string;
  };
}) {
  const res = await api.post("/reviews", review);
  return res.data as ReviewDto;
}

export async function updateReview(reviewId: string | number, data: { puntuacion: number; comentario: string }) {
  const res = await api.put(`/reviews/${reviewId}`, data);
  return res.data;
}

export async function deleteReview(reviewId: string | number) {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
}
