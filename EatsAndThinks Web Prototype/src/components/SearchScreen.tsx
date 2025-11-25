// src/components/SearchScreen.tsx
import { useState, useEffect } from "react";
import { searchPlaces, Place } from "../services/places";
import api from "../services/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  X,
  TrendingUp,
  DollarSign,
  Clock,
  Utensils,
  History,
  Trash2
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getPlaceImage } from "../utils/placeImages";
import { saveSearch, getSearchHistory, clearSearchHistory } from "../services/searchHistory";
import { toast } from 'react-toastify';

interface SearchScreenProps {
  onRestaurantClick: (id: string) => void;
}

const CUISINE_TYPES = [
  "Restaurante", "Bar", "Café", "Heladería", "Comida rápida", 
  "Pizzeria", "Asiático", "Italiano", "Mexicano", "Vegetariano",
  "Español", "Mediterráneo", "Americano", "Marisquería", "Tapas"
];

const PRICE_LEVELS = [
  { value: 1, label: "€", desc: "Económico" },
  { value: 2, label: "€€", desc: "Moderado" },
  { value: 3, label: "€€€", desc: "Caro" },
  { value: 4, label: "€€€€", desc: "Muy caro" }
];

// Mapeo de tipos en español a tipos de Google
const CUISINE_MAPPING: Record<string, string> = {
  "Restaurante": "restaurant",
  "Bar": "bar",
  "Café": "cafe",
  "Heladería": "ice_cream",
  "Comida rápida": "fast_food",
  "Pizzeria": "pizza",
  "Asiático": "asian_restaurant",
  "Italiano": "italian_restaurant",
  "Mexicano": "mexican_restaurant",
  "Vegetariano": "vegetarian_restaurant",
  "Español": "spanish_restaurant",
  "Mediterráneo": "mediterranean_restaurant",
  "Americano": "american_restaurant",
  "Marisquería": "seafood_restaurant",
  "Tapas": "tapas_restaurant"
};

export function SearchScreen({ onRestaurantClick }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState([1]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([1, 2, 3, 4]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Cargar API Key desde el backend
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await api.get("/config/google-api-key");
        setApiKey(res.data.apiKey);
      } catch (err) {
        console.error("Error obteniendo API key:", err);
        setApiKey(process.env.REACT_APP_GOOGLE_API_KEY || "");
      }
    };
    fetchApiKey();
  }, []);

  const handleSearch = async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) {
      toast.warning("Por favor ingresa un término de búsqueda");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    // Guardar en el historial (opcional, no bloquea la búsqueda)
    try {
      await saveSearch(query);
      await loadHistory();
    } catch (err) {
      console.log('No se pudo guardar en el historial:', err);
    }

    try {
      console.log("🔍 Iniciando búsqueda con filtros:", {
        query: query,
        minRating: minRating[0],
        selectedCuisines,
        selectedPrices,
        openNowOnly
      });

      // Mapear tipos de cocina en español a tipos de Google
      const mappedCuisines = selectedCuisines.map(cuisine => 
        CUISINE_MAPPING[cuisine] || cuisine
      );

      const data = await searchPlaces({
        query: query,
        minRating: minRating[0],
        selectedCuisines: mappedCuisines,
        selectedPrices: selectedPrices,
        openNowOnly: openNowOnly
      });
      
      console.log("📊 Resultados recibidos:", data);
      setResults(data || []);
    } catch (err: any) {
      console.error("Error buscando lugares:", err);
      toast.error(err?.response?.data?.message || "Error al buscar lugares");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Cargar historial al montar el componente
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (err) {
      console.log('No se pudo cargar el historial:', err);
      setSearchHistory([]);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('¿Eliminar todo el historial de búsquedas?')) return;
    await clearSearchHistory();
    setSearchHistory([]);
    toast.success('🗑️ Historial eliminado');
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const togglePrice = (price: number) => {
    setSelectedPrices(prev =>
      prev.includes(price)
        ? prev.filter(p => p !== price)
        : [...prev, price]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMinRating([1]);
    setSelectedCuisines([]);
    setSelectedPrices([1, 2, 3, 4]);
    setOpenNowOnly(false);
    setResults([]);
    setSearched(false);
    setError(null);
  };

  const getPriceLabel = (level: number) => {
    return PRICE_LEVELS.find(p => p.value === level)?.label || "€";
  };

  // Función para obtener la URL de la foto de Google (prioridad)
const getGooglePhotoUrl = (place: any): string | null => {
  if (place.photoRef && apiKey) {
    // La URL de Google es la fuente principal
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photoRef}&key=${apiKey}`;
  }
  return null;
};
  // Función para aplicar filtros adicionales en el frontend (como respaldo)
  const applyFrontendFilters = (places: Place[]) => {
    let filtered = places;

    // Filtrar por tipos de cocina seleccionados
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(place => {
        const placeType = place.type?.toLowerCase() || '';
        return selectedCuisines.some(cuisine => 
          placeType.includes(cuisine.toLowerCase())
        );
      });
    }

    // Filtrar por niveles de precio seleccionados
    if (selectedPrices.length > 0 && selectedPrices.length < 4) {
      filtered = filtered.filter(place => 
        place.priceLevel && selectedPrices.includes(place.priceLevel)
      );
    }

    // Filtrar por "abierto ahora"
    if (openNowOnly) {
      filtered = filtered.filter(place => place.openNow === true);
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-orange-50/20">
      {/* Header con gradiente */}
      <div className="relative bg-gradient-to-r from-teal-500 via-teal-600 to-orange-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-6 h-6 text-teal-300" />
            <span className="text-white/90 text-sm font-medium">Explorar</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            🔍 Búsqueda en Madrid
          </h1>
          <p className="text-xl text-white/90">
            Encuentra el lugar perfecto en la Comunidad de Madrid
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="flex items-center gap-2 text-gray-800 font-semibold">
                    <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                    Filtros
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? <X /> : <SlidersHorizontal />}
                  </Button>
                </div>

                <div className={`space-y-6 ${!showFilters ? 'hidden lg:block' : ''}`}>
                  {/* Valoración mínima */}
                  <div>
                    <Label className="text-sm mb-3 flex items-center gap-2 font-medium">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Valoración mínima
                    </Label>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Desde {minRating[0]} ☆</span>
                    </div>
                    <Slider
                      value={minRating}
                      onValueChange={setMinRating}
                      min={1}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Tipo de cocina */}
                  <div>
                    <Label className="text-sm mb-3 flex items-center gap-2 font-medium">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      Tipo de cocina
                    </Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {CUISINE_TYPES.map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={cuisine}
                            checked={selectedCuisines.includes(cuisine)}
                            onCheckedChange={() => toggleCuisine(cuisine)}
                          />
                          <label
                            htmlFor={cuisine}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                            {cuisine}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rango de precio */}
                  <div>
                    <Label className="text-sm mb-3 flex items-center gap-2 font-medium">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Rango de precio
                    </Label>
                    <div className="space-y-2">
                      {PRICE_LEVELS.map((price) => (
                        <div key={price.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`price-${price.value}`}
                            checked={selectedPrices.includes(price.value)}
                            onCheckedChange={() => togglePrice(price.value)}
                          />
                          <label
                            htmlFor={`price-${price.value}`}
                            className="text-sm text-gray-700 cursor-pointer flex-1"
                          >
                            {price.label} <span className="text-gray-500">- {price.desc}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Abierto ahora */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="open-now"
                        checked={openNowOnly}
                        onCheckedChange={(checked) => setOpenNowOnly(!!checked)}
                      />
                      <label
                        htmlFor="open-now"
                        className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-blue-500" />
                        Solo abierto ahora
                      </label>
                    </div>
                  </div>

                  {/* Botón limpiar */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Área principal de búsqueda y resultados */}
          <div className="lg:col-span-3">
            {/* Barra de búsqueda */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
              <div className="relative mb-4">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Ej: sushi Coslada, pizza Alcalá, restaurante Madrid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-14 pr-4 py-7 rounded-2xl border-2 border-gray-200 focus:border-teal-400 text-lg"
                />
              </div>

              {/* Historial de búsquedas */}
              {!searched && searchHistory.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-orange-50 rounded-xl border border-teal-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <History className="w-4 h-4 text-teal-600" />
                      Búsquedas recientes
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearHistory}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white hover:bg-teal-100 cursor-pointer transition-all border border-teal-200"
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearch(term);
                        }}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros activos */}
              {(selectedCuisines.length > 0 || selectedPrices.length < 4 || openNowOnly || minRating[0] > 1) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCuisines.map(cuisine => (
                    <Badge key={cuisine} variant="secondary" className="bg-orange-100 text-orange-700">
                      {cuisine}
                      <button
                        onClick={() => toggleCuisine(cuisine)}
                        className="ml-1 hover:text-orange-900"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {minRating[0] > 1 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      ⭐ {minRating[0]}+
                    </Badge>
                  )}
                  {openNowOnly && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      🕐 Abierto ahora
                    </Badge>
                  )}
                </div>
              )}

              <Button
                onClick={() => handleSearch()}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 py-6 rounded-xl shadow-lg text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando en Madrid...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Buscar lugares
                  </span>
                )}
              </Button>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Resultados */}
            {searched && !loading && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                    {results.length > 0
                      ? `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} en Madrid`
                      : "No se encontraron resultados en Madrid"}
                  </h2>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((place) => (
                      <Card
                        key={place.placeId}
                        className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-2xl border-2 border-transparent hover:border-teal-300"
                        onClick={() => onRestaurantClick(place.placeId)}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <ImageWithFallback
                          // Fuente principal: Foto de Google. Si es null, ImageWithFallback usará el fallbackSrc
  src={getGooglePhotoUrl(place)}

  // Fuente de fallback (tu lógica Fuzzy)
  fallbackSrc={getPlaceImage(place.type, place.placeId)}
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {place.openNow && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                                <Clock className="w-3 h-3 mr-1" />
                                Abierto
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg text-gray-800 mb-1 font-semibold">
                                {place.name}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {place.type}
                              </Badge>
                            </div>
                            <span className="text-gray-600 ml-2">
                              {getPriceLabel(place.priceLevel)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              <span className="text-gray-900 text-lg font-semibold">
                                {place.rating}
                              </span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              ({place.userRatingsTotal} reseñas)
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate">{place.formattedAddress}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg mb-2">No encontramos resultados en Madrid</p>
                    <p className="text-sm text-gray-400">Intenta ajustar tus filtros o buscar otro término</p>
                  </div>
                )}
              </div>
            )}

            {!searched && !loading && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-600 text-lg mb-2">Comienza tu búsqueda en Madrid</p>
                <p className="text-sm text-gray-400">Usa los filtros y la barra de búsqueda para encontrar tu lugar ideal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}