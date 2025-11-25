import api from "./api";

export async function saveSearch(searchTerm: string) {
  try {
    const res = await api.post('/search-history', { searchTerm });
    return res.data;
  } catch (error) {
    console.error('Error guardando búsqueda:', error);
  }
}

export async function getSearchHistory(): Promise<string[]> {
  try {
    const res = await api.get('/search-history');
    return res.data;
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
}

export async function clearSearchHistory() {
  try {
    const res = await api.delete('/search-history');
    return res.data;
  } catch (error) {
    console.error('Error eliminando historial:', error);
  }
}

