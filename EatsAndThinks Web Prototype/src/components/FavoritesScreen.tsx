import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, MapPin, Heart, Sparkles, Search, Filter, ArrowRight, TrendingUp } from 'lucide-react';
import { getFavorites, removeFavorite, FavoritePlace } from '../services/favorites';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPlaceImage } from '../utils/placeImages';

interface FavoritesScreenProps {
  onRestaurantClick: (id: string) => void;
}

export function FavoritesScreen({ onRestaurantClick }: FavoritesScreenProps) {
  // --- LÓGICA ORIGINAL MANTENIDA ---
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => { loadFavorites(); }, []);
  useEffect(() => { filterFavorites(); }, [searchQuery, filterType, favorites]);

  const loadFavorites = async () => { 
    try { 
      setLoading(true); 
      const data = await getFavorites(); 
      setFavorites(data); 
      setFilteredFavorites(data); 
    } catch (error) { 
      console.error(error); 
      alert('Error cargando favoritos'); 
    } finally { 
      setLoading(false); 
    } 
  };

  const filterFavorites = () => {
    let filtered = [...favorites];
    if (searchQuery) {
      filtered = filtered.filter(fav => 
        fav.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fav.address?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        fav.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(fav => fav.type?.toLowerCase().includes(filterType.toLowerCase()));
    }
    setFilteredFavorites(filtered);
  };

  const handleRemoveFavorite = async (placeId: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}" de favoritos?`)) return;
    try { 
      await removeFavorite(placeId); 
      setFavorites(favorites.filter(f => f.placeId !== placeId)); 
      alert('✅ Eliminado de favoritos'); 
    } catch (error) { 
      alert('❌ Error al eliminar'); 
    }
  };

  const getImageUrl = (place: FavoritePlace): string => {
    return getPlaceImage(place.type, place.placeId);
  };

  const getPriceLabel = (level?: number) => level ? '€'.repeat(level) : '€';
  
  const types = ['all', 'restaurant', 'cafe', 'bar', 'pizzeria', 'asiatico'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50/20 to-orange-50/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
          <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-teal-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-orange-50/20 pb-24">
      {/* 🎨 HERO BANNER CON ORBS FLOTANTES Y EFECTOS ESPECTACULARES */}
      <div className="relative bg-gradient-to-r from-teal-500 via-teal-600 to-orange-500 py-20 px-6 overflow-hidden">
        {/* Orbs flotantes animados */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl animate-spin-slow"></div>
        
        {/* Patrón de textura */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        
        {/* Efecto shimmer */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 text-white px-4 py-2 rounded-full mb-6 shadow-2xl shadow-teal-900/20 animate-fade-in-up">
            <div className="relative">
              <Heart className="w-4 h-4 fill-white animate-pulse" />
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 animate-ping"></div>
            </div>
            <span className="font-bold tracking-wide">Tu Colección Personal</span>
          </div>

          {/* Título con gradiente de texto */}
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Mis Favoritos
            <Sparkles className="inline-block ml-4 w-12 h-12 text-yellow-200 animate-spin-slow" />
          </h1>
          
          <p className="text-teal-50 text-xl max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {favorites.length === 0 
              ? 'Empieza a crear tu colección de lugares especiales' 
              : `Tu lista curada de ${favorites.length} ${favorites.length === 1 ? 'lugar imprescindible' : 'lugares imprescindibles'}.`
            }
          </p>

          {/* Estadísticas flotantes */}
          {favorites.length > 0 && (
            <div className="flex gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
                <div className="text-3xl font-black text-white">{favorites.length}</div>
                <div className="text-teal-100 text-sm">Favoritos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
                <div className="text-3xl font-black text-white">
                  {(favorites.reduce((sum, f) => sum + (f.rating || 0), 0) / favorites.length).toFixed(1)}⭐
                </div>
                <div className="text-teal-100 text-sm">Rating Promedio</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* 🔍 SEARCH BAR CON GLASSMORPHISM */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/50 p-3 flex flex-col md:flex-row gap-3 mb-16 border border-white/60 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              className="w-full h-14 pl-14 pr-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 outline-none placeholder:text-gray-400 text-gray-900 font-medium transition-all focus:bg-white focus:border-teal-300 focus:shadow-lg focus:shadow-teal-100"
              placeholder="Buscar en tu colección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filtros tipo pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg ${
                  filterType === type 
                    ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-teal-300 scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-105 border border-gray-200'
                }`}
              >
                {type === 'all' ? '✨ Todo' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 📋 ESTADO VACÍO PREMIUM */}
        {filteredFavorites.length === 0 ? (
          <div className="relative overflow-hidden">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-white to-orange-100 rounded-[3rem] animate-gradient"></div>
            
            <div className="relative flex flex-col items-center justify-center py-24 text-center bg-white/50 backdrop-blur-xl rounded-[3rem] border-4 border-dashed border-teal-200 shadow-2xl">
              {/* Icono con efectos */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-teal-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-teal-100 to-orange-100 rounded-full flex items-center justify-center shadow-2xl shadow-teal-300/50">
                  <Heart className="w-16 h-16 text-teal-400 animate-bounce-slow" />
                </div>
              </div>

              <h3 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                {searchQuery ? 'Sin resultados' : 'Tu lista está vacía'}
              </h3>
              <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed">
                {searchQuery 
                  ? 'Intenta con otro término de búsqueda o ajusta los filtros.' 
                  : 'Empieza a guardar lugares que te encanten para tenerlos siempre a mano.'
                }
              </p>
              
              {!searchQuery && (
                <Button 
                  onClick={() => window.location.href = '#/search'} 
                  className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600 text-white h-14 px-10 rounded-2xl shadow-2xl shadow-teal-300/50 hover:scale-105 transition-all font-bold group"
                >
                  <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Explorar lugares
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* 🎴 GRID DE FAVORITOS CON CARDS PREMIUM */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((place, idx) => (
              <div 
                key={place.id}
                className="group relative bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:shadow-teal-200/50 transition-all duration-500 border border-gray-100 hover:border-teal-200 overflow-hidden cursor-pointer animate-fade-in-up hover:-translate-y-2"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => onRestaurantClick(place.placeId)}
              >
                {/* Imagen con overlays */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={getImageUrl(place)}
                    alt={place.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                  />
                  
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Efecto shimmer en hover */}
                  <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>

                  {/* Botón de favorito */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleRemoveFavorite(place.placeId, place.name); 
                      }}
                      className="relative group/heart p-3 bg-white/90 backdrop-blur-md rounded-2xl text-pink-500 shadow-xl hover:bg-white hover:scale-110 transition-all"
                    >
                      <Heart className="w-6 h-6 fill-current" />
                      <div className="absolute inset-0 bg-pink-500 rounded-2xl blur-lg opacity-0 group-hover/heart:opacity-30 transition-opacity"></div>
                    </button>
                  </div>

                  {/* Badge de rating */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-black/50 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{place.rating?.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* CTA que aparece en hover */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Button 
                      variant="default" 
                      className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-2xl font-bold h-12 shadow-2xl group/btn"
                    >
                      <span>Ver Detalles</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-2xl text-gray-900 leading-tight line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-orange-500 transition-all">
                      {place.name}
                    </h3>
                    <span className="text-green-600 font-black bg-green-50 px-3 py-1 rounded-xl text-sm border border-green-200 shadow-sm">
                      {getPriceLabel(place.priceLevel)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-5">
                    <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span className="truncate text-sm">{place.address || 'Madrid'}</span>
                  </div>

                  {/* Footer con badge de tipo */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Badge 
                      variant="outline" 
                      className="border-teal-200 text-teal-700 bg-teal-50 font-bold px-3 py-1 rounded-xl"
                    >
                      {place.type}
                    </Badge>
                    
                    <div className="text-xs text-gray-400">
                      Añadido {new Date(place.addedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Efecto de brillo en el borde en hover */}
                <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-teal-500/20 via-orange-500/20 to-teal-500/20 blur-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}