import api from "./api";

export interface Place {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  type?: string;
  openNow?: boolean;
  photoRef?: string;
  source?: string;
}

export interface PlaceDetail extends Place {
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  googleReviews?: GoogleReview[];
}

export interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
}

export interface SearchParams {
  query: string;
  minRating?: number;
  selectedCuisines?: string[];
  selectedPrices?: number[];
  openNowOnly?: boolean;
  limit?: number;
}

export async function searchPlaces(params: SearchParams): Promise<Place[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('query', params.query);
  
  if (params.minRating) queryParams.append('minRating', params.minRating.toString());
  if (params.openNowOnly) queryParams.append('openNowOnly', 'true');
  if (params.selectedPrices && params.selectedPrices.length > 0) {
    params.selectedPrices.forEach(p => queryParams.append('priceLevel', p.toString()));
  }
  
  const res = await api.get(`/locales/search?${queryParams.toString()}`);
  return res.data;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetail> {
  const res = await api.get(`/locales/details/${placeId}`);
  return res.data;
}

export async function getAllLocales(): Promise<Place[]> {
  const res = await api.get('/locales');
  return res.data;
}

export async function getCommunityLocales(): Promise<Place[]> {
  const res = await api.get('/locales/community');
  return res.data;
}
