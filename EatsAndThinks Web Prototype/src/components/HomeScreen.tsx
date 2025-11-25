import React, { useEffect, useState } from "react";
import { getAllLocales, Place, searchPlaces, getCommunityLocales } from "../services/places";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getPlaceImage } from "../utils/placeImages";
import { addFavorite, removeFavorite, checkFavorite } from "../services/favorites";
import { Award, ArrowRight, Flame, Star, Heart, MapPin, DollarSign, Gem, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "./ui/badge";

interface HomeScreenProps {
  onRestaurantClick: (id: string) => void;
}

const FEATURED_TYPES = [
  "Bar", "Cafe", "Restaurante", "Heladeria",
  "Comida rápida", "Pizzeria", "Asiatico"
];

export function HomeScreen({ onRestaurantClick }: HomeScreenProps) {
  // ============================================
  // ⚙️ LÓGICA DE DATOS (INTACTA - TU BACKEND)
  // ============================================
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [mostReviewedPlaces, setMostReviewedPlaces] = useState<Place[]>([]);
  const [lowCostPlaces, setLowCostPlaces] = useState<Place[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Place[]>([]);
  const [communityPlaces, setCommunityPlaces] = useState<Place[]>([]);
  const [favoritesMap, setFavoritesMap] = useState<Map<string, boolean>>(new Map());
  const [apiKey, setApiKey] = useState<string>("");
  const [sectionsLoading, setSectionsLoading] = useState({
    featured: true,
    mostReviewed: true,
    lowCost: true,
    hiddenGems: true
  });
  const { user, isAuthenticated } = useAuth();

  const normalizeType = (type?: string): string => {
    if (!type) return "restaurant";
    return type.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const processFeaturedPlaces = (places: Place[]) => {
    const highRated = places.filter(p => (p.rating || 0) >= 4.7);
    const byTypeHighRated: Record<string, Place[]> = {};
    highRated.forEach(place => {
      const type = normalizeType(place.type);
      if (!byTypeHighRated[type]) byTypeHighRated[type] = [];
      byTypeHighRated[type].push(place);
    });
    const featured: Place[] = [];
    const mainTypes = ["bar", "cafe", "restaurante"];
    mainTypes.forEach(type => {
      const placesOfType = byTypeHighRated[type] || [];
      if (placesOfType.length > 0) {
        const sorted = placesOfType.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        featured.push(sorted[0]);
      }
    });
    if (featured.length < 3) {
      FEATURED_TYPES.forEach(type => {
        if (featured.length >= 3) return;
        const normalized = normalizeType(type);
        if (mainTypes.includes(normalized)) return;
        const placesOfType = byTypeHighRated[normalized] || [];
        if (placesOfType.length > 0) {
          const sorted = placesOfType.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          if (!featured.some(p => p.placeId === sorted[0].placeId)) featured.push(sorted[0]);
        }
      });
    }
    if (featured.length < 3) {
      const byTypeAll: Record<string, Place[]> = {};
      places.forEach(place => {
        const type = normalizeType(place.type);
        if (!byTypeAll[type]) byTypeAll[type] = [];
        byTypeAll[type].push(place);
      });
      FEATURED_TYPES.forEach(type => {
        if (featured.length >= 3) return;
        const normalized = normalizeType(type);
        if (featured.some(p => normalizeType(p.type) === normalized)) return;
        const placesOfType = byTypeAll[normalized] || [];
        if (placesOfType.length > 0) {
          const sorted = placesOfType.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          if (!featured.some(p => p.placeId === sorted[0].placeId)) featured.push(sorted[0]);
        }
      });
    }
    if (featured.length < 3) {
      places.forEach(place => {
        if (featured.length >= 3) return;
        if (!featured.some(p => p.placeId === place.placeId)) featured.push(place);
      });
    }
    setFeaturedPlaces(featured.slice(0, 3));
  };

  const getImageUrl = (place: Place): string => {
    if (place.photoRef && apiKey) return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photoRef}&key=${apiKey}`;
    return getPlaceImage(place.type, place.placeId);
  };

  const checkAllFavorites = async (places: Place[]) => {
    if (!isAuthenticated) return;
    const newFavMap = new Map<string, boolean>();
    for (const place of places) {
      try {
        const isFav = await checkFavorite(place.placeId);
        newFavMap.set(place.placeId, isFav);
      } catch (error) {
        newFavMap.set(place.placeId, false);
      }
    }
    setFavoritesMap(newFavMap);
  };

  const handleToggleFavorite = async (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) { alert('Debes iniciar sesión para guardar favoritos'); return; }
    const isFav = favoritesMap.get(placeId) || false;
    try {
      if (isFav) {
        await removeFavorite(placeId);
        setFavoritesMap(prev => { const newMap = new Map(prev); newMap.set(placeId, false); return newMap; });
      } else {
        await addFavorite(placeId);
        setFavoritesMap(prev => { const newMap = new Map(prev); newMap.set(placeId, true); return newMap; });
      }
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || 'Error al actualizar favoritos'));
    }
  };

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const configResponse = await api.get("/config/google-api-key");
        setApiKey(configResponse.data.apiKey);
      } catch (err) { console.error("Error loading API key:", err); }
    };
    loadApiKey();
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setSectionsLoading(prev => ({ ...prev, featured: true }));
        const allLocalData = await getAllLocales();
        setAllPlaces(allLocalData);
        processFeaturedPlaces(allLocalData);
        await checkAllFavorites(allLocalData);
      } catch (err) { console.error("Error loading featured:", err); } finally { setSectionsLoading(prev => ({ ...prev, featured: false })); }
    };
    loadFeatured();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadCommunityPlaces = async () => {
      try {
        const data = await getCommunityLocales();
        setCommunityPlaces(data);
        await checkAllFavorites(data);
      } catch (err) {
        console.error("Error loading community places:", err);
        setCommunityPlaces([]);
      }
    };
    loadCommunityPlaces();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadMostReviewed = async () => {
      try {
        setSectionsLoading(prev => ({ ...prev, mostReviewed: true }));
        const queries = ["restaurantes populares Madrid", "mejores restaurantes Madrid", "restaurantes famosos Madrid"];
        let results: Place[] = [];
        for (const query of queries) {
          try {
            const data = await searchPlaces({ query, minRating: 4.0, limit: 10 });
            results = [...results, ...data];
            if (results.length >= 10) break;
          } catch (err) { console.error(`Error with query "${query}":`, err); }
        }
        const uniquePlaces = Array.from(new Map(results.map(p => [p.placeId, p])).values());
        const sorted = uniquePlaces.sort((a, b) => (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0)).slice(0, 5);
        setMostReviewedPlaces(sorted);
        await checkAllFavorites(sorted);
      } catch (err) { console.error("Error loading most reviewed:", err); } finally { setSectionsLoading(prev => ({ ...prev, mostReviewed: false })); }
    };
    const timer = setTimeout(loadMostReviewed, 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    const loadLowCost = async () => {
      try {
        setSectionsLoading(prev => ({ ...prev, lowCost: true }));
        const data = await searchPlaces({ query: "restaurantes baratos Madrid", minRating: 4.0, selectedPrices: [1], limit: 5 });
        setLowCostPlaces(data);
        await checkAllFavorites(data);
      } catch (err) { console.error("Error loading low cost:", err); } finally { setSectionsLoading(prev => ({ ...prev, lowCost: false })); }
    };
    const timer = setTimeout(loadLowCost, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    const loadHiddenGems = async () => {
      try {
        setSectionsLoading(prev => ({ ...prev, hiddenGems: true }));
        
        console.log("🔍 Starting Hidden Gems search...");
        
        // Múltiples búsquedas diversas
        const queries = [
          "restaurantes nuevos Madrid",
          "restaurantes auténticos Madrid",
          "restaurantes tradicionales Madrid",
          "tapas Madrid",
          "bares Madrid",
          "restaurantes familiares Madrid"
        ];
        
        let allResults: Place[] = [];
        for (const query of queries) {
          try {
            console.log(`🔎 Searching: "${query}"`);
            // Sin minRating para obtener más resultados
            const data = await searchPlaces({ query, limit: 20 });
            console.log(`✅ Found ${data.length} places for "${query}"`);
            allResults = [...allResults, ...data];
          } catch (err) {
            console.error(`❌ Error with hidden gems query "${query}":`, err);
          }
        }
        
        console.log(`📊 Total results before filtering: ${allResults.length}`);
        
        // Eliminar duplicados
        const uniquePlaces = Array.from(new Map(allResults.map(p => [p.placeId, p])).values());
        console.log(`📊 Unique places: ${uniquePlaces.length}`);
        
        // FILTRO SÚPER FLEXIBLE: entre 10-400 reseñas, rating >= 3.5
        const filtered = uniquePlaces
          .filter(place => {
            const reviews = place.userRatingsTotal || 0;
            const rating = place.rating || 0;
            const passes = reviews >= 10 && reviews <= 400 && rating >= 3.5;
            if (passes) {
              console.log(`✅ PASS: ${place.name} - ${reviews} reviews, ${rating}⭐`);
            } else {
              console.log(`❌ FAIL: ${place.name} - ${reviews} reviews, ${rating}⭐`);
            }
            return passes;
          })
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);
        
        console.log(`💎 Hidden Gems filtered: ${filtered.length}`, filtered);
        setHiddenGems(filtered);
        await checkAllFavorites(filtered);
      } catch (err) { 
        console.error("❌ Error loading hidden gems:", err); 
      } finally { 
        setSectionsLoading(prev => ({ ...prev, hiddenGems: false })); 
      }
    };
    const timer = setTimeout(loadHiddenGems, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // ============================================
  // 🎨 COMPONENTES VISUALES (ESTILO GEMINI+)
  // ============================================

  const SectionSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse bg-white rounded-3xl p-4 shadow-lg">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-52 rounded-2xl mb-4"></div>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-4 rounded-full w-3/4 mb-3"></div>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-3 rounded-full w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const PlaceCard: React.FC<{ place: Place; showTopBadge?: boolean; showGemBadge?: boolean; showValueBadge?: boolean; showCommunityBadge?: boolean; delay?: number }> = ({ 
    place, 
    showTopBadge, 
    showGemBadge, 
    showValueBadge,
    showCommunityBadge, 
    delay = 0 
  }) => {
    const isFav = favoritesMap.get(place.placeId) || false;

    return (
      <div 
        className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer animate-fade-in-up border border-gray-100 hover:border-orange-200"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => onRestaurantClick(place.placeId)}
      >
        {/* Imagen */}
        <div className="relative h-52 overflow-hidden">
          <ImageWithFallback
            src={getImageUrl(place)}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          
          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex gap-2">
            {showTopBadge && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-xl shadow-orange-500/50">
                🔥 Top Rated
              </Badge>
            )}
            {showGemBadge && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-xl shadow-purple-500/50">
                💎 Gem
              </Badge>
            )}
            {showValueBadge && (
              <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-xl shadow-green-500/50">
                💰 Value
              </Badge>
            )}
            {showCommunityBadge && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 rounded-full px-3 py-1 text-xs font-bold shadow-xl shadow-purple-500/50">
                <Users className="w-3 h-3 mr-1" /> Comunidad
              </Badge>
            )}
          </div>

          {/* Botón favorito */}
          <button
            onClick={(e) => handleToggleFavorite(place.placeId, e)}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 shadow-xl ${
              isFav 
                ? 'bg-white border-white/50 text-red-500' 
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
          >
            <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>

          {/* Badge de categoría y rating */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <Badge className="bg-white/95 backdrop-blur-md text-gray-800 border-0 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg">
              {place.type}
            </Badge>
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold">{place.rating?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {place.name}
          </h3>
          
          <div className="flex items-start gap-2 text-gray-500 text-xs mb-4">
            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{place.formattedAddress || "Madrid, España"}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-gray-400 text-xs font-medium">{place.userRatingsTotal || 0} reviews</span>
            <span className="text-orange-600 font-bold text-xs uppercase flex items-center gap-1.5 group-hover:gap-2 transition-all">
              VIEW <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 🖼️ RENDERIZADO FINAL
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 pb-20">
      {/* HERO SECTION CON ANIMACIONES */}
      <div className="relative h-96 overflow-hidden mb-16 bg-gray-900 rounded-[2.5rem] mx-6 mt-6 shadow-2xl shadow-orange-900/20 border-2 border-white/10">
        {/* Imagen con efecto parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-50 animate-slow-zoom"
            alt="Madrid Dining"
          />
        </div>
        
        {/* Gradientes superpuestos */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center z-10">
          <div className="animate-fade-in-up">
            <Badge className="bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-xl text-orange-100 border border-orange-400/30 mb-5 inline-flex items-center gap-2 px-5 py-2 rounded-full shadow-2xl shadow-orange-500/20">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="font-bold">Discover Madrid's Gastronomy</span>
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 animate-gradient">
                {user?.email ? user.email.split('@')[0] : 'Alex'}
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mb-10 leading-relaxed">
              Explore our curated selection of the city's best flavors. What are you craving today?
            </p>

            {/* Stats animados */}
            <div className="flex gap-8">
              {[
                { label: 'PLACES', val: `${allPlaces.length}+`, icon: '🍽️', delay: '0ms' },
                { label: 'REVIEWS', val: allPlaces.reduce((sum, p) => sum + (p.userRatingsTotal || 0), 0).toLocaleString(), icon: '⭐', delay: '100ms' },
                { label: 'AVG RATING', val: '4.7', icon: '🏆', delay: '200ms' }
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl shadow-2xl shadow-black/20 hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white leading-none mb-1">{stat.val}</div>
                    <div className="text-xs text-orange-300 uppercase tracking-widest font-bold">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Degradado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-orange-50/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Premium Selection */}
        {featuredPlaces.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Premium Selection</h2>
                <p className="text-gray-500 text-sm mt-1">Hand-picked excellence</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPlaces.map((place, idx) => (
                <PlaceCard key={place.placeId} place={place} showTopBadge={true} delay={idx * 100} />
              ))}
            </div>
          </section>
        )}

        {/* Trending This Week */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-pink-500/30">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Trending This Week</h2>
              <p className="text-gray-500 text-sm mt-1">Most popular right now</p>
            </div>
          </div>

          {sectionsLoading.mostReviewed ? (
            <SectionSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mostReviewedPlaces.slice(0, 3).map((place, idx) => (
                <PlaceCard key={place.placeId} place={place} delay={idx * 50} />
              ))}
            </div>
          )}
        </section>

        {/* Hidden Gems - SIEMPRE VISIBLE */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Hidden Gems</h2>
              <p className="text-gray-500 text-sm mt-1">Undiscovered treasures</p>
            </div>
          </div>
          
          {sectionsLoading.hiddenGems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-4 shadow-lg">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-52 rounded-2xl mb-4"></div>
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-4 rounded-full w-3/4 mb-3"></div>
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-3 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : hiddenGems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hiddenGems.slice(0, 2).map((place, idx) => (
                <PlaceCard key={place.placeId} place={place} showGemBadge={true} delay={idx * 50} />
              ))}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 text-center border-2 border-dashed border-purple-200">
              <Gem className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No hidden gems found at the moment</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new discoveries!</p>
            </div>
          )}
        </section>

        {/* Locales de la Comunidad */}
        {communityPlaces.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Locales de la Comunidad</h2>
                <p className="text-gray-500 text-sm mt-1">Creados por administradores de EatsAndThinks</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communityPlaces.map((place, idx) => (
                <PlaceCard key={place.placeId} place={place} showCommunityBadge={true} delay={idx * 50} />
              ))}
            </div>
          </section>
        )}

        {/* Cheap Eats */}
        {(sectionsLoading.lowCost || lowCostPlaces.length > 0) && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-500/30">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Cheap Eats</h2>
                <p className="text-gray-500 text-sm mt-1">Quality on a budget</p>
              </div>
            </div>
            {sectionsLoading.lowCost ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-3xl p-4 shadow-lg">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-52 rounded-2xl mb-4"></div>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-4 rounded-full w-3/4 mb-3"></div>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 h-3 rounded-full w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {lowCostPlaces.slice(0, 2).map((place, idx) => (
                  <PlaceCard key={place.placeId} place={place} showValueBadge={true} delay={idx * 50} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}