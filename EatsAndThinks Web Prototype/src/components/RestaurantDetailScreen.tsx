import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getReviewsByPlace, postReview, ReviewDto } from "../services/reviews";
import { getPlaceDetails, PlaceDetail } from "../services/places";
import { useAuth } from "../context/AuthContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  ArrowLeft,
  User,
  Calendar,
  ThumbsUp,
  Share2,
  Heart,
  CheckCircle,
  Navigation,
  MessageSquare,
  Send,
  ExternalLink
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getPlaceImage } from "../utils/placeImages";
import { addFavorite, removeFavorite, checkFavorite } from '../services/favorites';
import { toast } from 'react-toastify';

interface Props {
  placeId: string;
  onBack: () => void;
}

export function RestaurantDetailScreen({ placeId, onBack }: Props) {
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const { isAuthenticated, user } = useAuth();
  const [apiKey, setApiKey] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const fetchPlaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiRes = await api.get("/config/google-api-key");
      const key = apiRes.data.apiKey; 
      setApiKey(key);

      const details = await getPlaceDetails(placeId);
      if (!details) throw new Error("No se pudieron obtener los detalles del lugar");
      
      // 🔧 FIX: El backend envía "reviews" pero la interfaz espera "googleReviews"
      // Normalizamos para que funcione con ambos
      const normalizedDetails = {
        ...details,
        googleReviews: (details as any).reviews || details.googleReviews || []
      };
      
      console.log("📦 DETALLES COMPLETOS:", normalizedDetails);
      console.log("📊 Google Reviews encontradas:", normalizedDetails.googleReviews?.length || 0);
      
      setPlace(normalizedDetails);
      
      try {
        const userReviews = await getReviewsByPlace(placeId);
        setReviews(userReviews);
      } catch (reviewError) {
        setReviews([]);
      }

    } catch (e: any) {
      console.error("❌ Error:", e);
      let errorMessage = "No se pudieron cargar los datos. ";
      if (e.response?.status === 404) errorMessage += "Restaurante no encontrado.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaceData(); }, [placeId]);

  useEffect(() => {
    const checkFav = async () => {
      if (isAuthenticated && placeId) {
        try {
          const fav = await checkFavorite(placeId);
          setIsFavorite(fav);
        } catch(e) { console.error(e); }
      }
    };
    checkFav();
  }, [placeId, isAuthenticated]);

  const handlePostReview = async () => {
    if (!isAuthenticated || !place) { 
      toast.warning("🔐 Debes iniciar sesión para publicar una reseña"); 
      return; 
    }

    // Verificar si es invitado
    const isGuest = localStorage.getItem('guestMode') === 'true';
    if (isGuest) {
      toast.info("🔒 Los invitados no pueden publicar reseñas. ¡Regístrate para compartir tu experiencia!");
      return;
    }
    
    if (newComment.length < 5) { 
      toast.warning("✍️ El comentario debe tener al menos 5 caracteres"); 
      return; 
    }

    try {
      setReviewsLoading(true);
      const newReview = await postReview({
        placeId: place.placeId,
        puntuacion: newRating,
        comentario: newComment,
        localData: {
          placeId: place.placeId,
          nombre: place.name,
          direccion: place.formattedAddress || "",
          tipo: place.type || "restaurant",
          lat: place.lat,
          lng: place.lng,
          priceLevel: place.priceLevel,
          photoRef: place.photoRef
        }
      });
      setReviews([newReview, ...reviews]);
      setNewComment("");
      setNewRating(5);
      toast.success("✅ Reseña publicada correctamente");
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Error al publicar la reseña.";
      toast.error("❌ " + errorMsg);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { 
      alert('Debes iniciar sesión'); 
      return; 
    }

    const isGuest = localStorage.getItem('guestMode') === 'true';
    if (isGuest) {
      const confirmRegister = confirm("🔒 Los invitados no pueden guardar favoritos.\n\n¿Deseas registrarte para guardar tus lugares favoritos?");
      if (confirmRegister) {
        window.location.hash = '#/register';
      }
      return;
    }

    try {
      setFavLoading(true);
      if (isFavorite) {
        await removeFavorite(placeId);
        setIsFavorite(false);
        toast.success('❌ Eliminado de favoritos');
      } else {
        await addFavorite(placeId);
        setIsFavorite(true);
        toast.success('⭐ Añadido a favoritos');
      }
    } catch (error: any) {
      toast.error('Error: ' + (error.response?.data?.message || 'Error al actualizar favoritos'));
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('✅ Enlace copiado al portapapeles');
  };

  const getPriceLevel = () => place?.priceLevel ? "€".repeat(place.priceLevel) : "N/A";

  const formatOpeningHours = (hours: string[] | undefined) => {
    if (!hours) return "Horario no disponible";
    const todayIndex = new Date().getDay();
    const apiIndex = todayIndex === 0 ? 6 : todayIndex - 1;
    if (hours.length === 1) return hours[0];
    return hours[apiIndex] || "Consultar horario completo";
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - (timestamp * 1000);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffYears > 0) return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
    if (diffMonths > 0) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    if (diffDays > 0) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return 'hoy';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    );
  }
  
  if (error || !place) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl text-gray-800 mb-4">{error || "Restaurante no encontrado"}</h1>
          <Button onClick={onBack} className="bg-orange-600 hover:bg-orange-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = place.photoRef && apiKey
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${place.photoRef}&key=${apiKey}`
    : getPlaceImage(place.type, place.placeId);

  // CALCULAR TOTAL DE RESEÑAS
  const googleReviewsCount = place.googleReviews?.length || 0;
  const userReviewsCount = reviews.length;
  const totalReviews = googleReviewsCount + userReviewsCount;

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in pb-20">
      {/* HERO SECTION INMERSIVO */}
      <div className="relative h-[60vh] w-full overflow-hidden group">
        <ImageWithFallback 
          src={mainImage} 
          alt={place.name} 
          className="w-full h-full object-cover transform transition-transform duration-[3s] group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
        
        {/* Navbar Flotante */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button 
            onClick={onBack} 
            className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
            >
              <Share2 size={22} />
            </button>
            <button 
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`p-3 backdrop-blur-md border border-white/20 rounded-full transition-all hover:scale-110 shadow-xl ${
                isFavorite ? 'bg-white text-red-500' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Contenido Hero */}
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 text-white z-20">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-orange-500/80 backdrop-blur-md border-0 text-white px-3 py-1 text-sm rounded-full">
                {place.type || "Restaurante"}
              </Badge>
              {place.openNow !== undefined && (
                <Badge className={`${
                  place.openNow ? "bg-green-500/80" : "bg-red-500/80"
                } backdrop-blur-md border-0 text-white px-3 py-1 text-sm rounded-full`}>
                  {place.openNow ? "Abierto ahora" : "Cerrado"}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 leading-tight text-white drop-shadow-sm">
              {place.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-lg text-gray-200">
              <div className="flex items-center gap-1.5 text-yellow-400 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">
                <Star className="fill-yellow-400 w-5 h-5" />
                <span className="text-white font-bold text-xl">{place.rating?.toFixed(1) || "N/A"}</span>
              </div>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{place.userRatingsTotal || 0} reseñas</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-green-400 font-bold text-xl">{getPriceLevel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL - Layout superpuesto */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-30 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Info y Reseñas */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tarjeta de Información */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="text-orange-500" /> Sobre este lugar
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {place.formattedAddress ? 
                  `Un lugar increíble ubicado en ${place.formattedAddress}. Disfruta de una experiencia gastronómica única con la mejor atención.` 
                  : "Un lugar especial para disfrutar de buena comida."}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{place.formattedAddress || "Dirección no disponible"}</p>
                      {place.lat && place.lng && (
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`, '_blank')}
                          className="text-sm text-orange-600 hover:underline mt-1"
                        >
                          Ver en mapa
                        </button>
                      )}
                    </div>
                  </div>
                  {place.phoneNumber && (
                    <div className="flex items-center gap-3 group">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Phone size={20} />
                      </div>
                      <a 
                        href={`tel:${place.phoneNumber}`} 
                        className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        {place.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {place.openingHours && (
                    <div className="flex items-start gap-3 group">
                      <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
                        <Clock size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">Horario de hoy</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg inline-block">
                          {formatOpeningHours(place.openingHours)}
                        </p>
                        <details className="mt-2 text-sm text-gray-500 cursor-pointer">
                          <summary className="hover:text-orange-600 transition-colors">Ver semana completa</summary>
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
                            {place.openingHours.map((h, i) => <div key={i}>{h}</div>)}
                          </div>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mapa embebido */}
              {place.lat && place.lng && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Ubicación en el mapa
                  </h3>
                  <div className="rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg h-[400px]">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${place.lat},${place.lng}&output=embed&z=16`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    📍 {place.formattedAddress || 'Ubicación exacta del restaurante'}
                  </p>
                </div>
              )}
            </div>

            {/* Sección de Reseñas */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="text-purple-500" /> Reseñas
                  {totalReviews > 0 && (
                    <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      {totalReviews}
                    </Badge>
                  )}
                </h2>
              </div>

              {/* Formulario de Reseña */}
              {isAuthenticated ? (
                <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 mb-10">
                  <h3 className="font-bold text-gray-900 mb-4">Comparte tu experiencia</h3>
                  <div className="mb-4 flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button 
                        key={r} 
                        type="button" 
                        onClick={() => setNewRating(r)} 
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${r <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="¿Cómo estuvo la comida? ¿El servicio? Cuéntanos todo..."
                      className="w-full p-5 pr-14 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none min-h-[120px] bg-white shadow-sm transition-all resize-none text-gray-600"
                    />
                    <button 
                      onClick={handlePostReview}
                      disabled={reviewsLoading || newComment.length < 5}
                      className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl text-center mb-10 border border-gray-200 border-dashed">
                  <p className="text-gray-500 mb-2">Inicia sesión para compartir tu opinión</p>
                </div>
              )}

              {/* TABS: Reseñas de Usuarios vs Google */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <button className="pb-3 px-1 border-b-2 border-orange-500 text-orange-600 font-bold text-sm">
                    TODAS ({totalReviews})
                  </button>
                </div>
              </div>

              {/* Lista de Reseñas */}
              <div className="space-y-6">
                {/* Reseñas de Usuarios */}
                {reviews.map((review, idx) => (
                  <div 
                    key={review.reviewId || Math.random()} 
                    className="group bg-gradient-to-br from-orange-50/50 to-white border border-orange-100 p-6 rounded-2xl hover:border-orange-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up" 
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {review.author ? review.author[0].toUpperCase() : <User size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{review.author || "Usuario"}</p>
                            <Badge className="bg-orange-500 text-white text-xs border-0">
                              Eats & Thinks
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <CheckCircle size={12} className="text-green-500" /> 
                            {review.fecha ? new Date(review.fecha).toLocaleDateString('es-ES') : "Reciente"}
                          </p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 px-3 py-1 rounded-lg flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{review.puntuacion}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comentario}</p>
                  </div>
                ))}

                {/* RESEÑAS DE GOOGLE - MEJORADAS */}
                {place.googleReviews && place.googleReviews.length > 0 && (
                  <>
                    {place.googleReviews.slice(0, 10).map((review, i) => (
                      <div 
                        key={i} 
                        className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 p-6 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${(reviews.length + i) * 50}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                              {review.authorName ? review.authorName[0].toUpperCase() : 'G'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{review.authorName}</span>
                                <Badge className="bg-blue-500 text-white text-xs border-0 flex items-center gap-1">
                                  <img 
                                    src="https://www.google.com/favicon.ico" 
                                    className="w-3 h-3" 
                                    alt="Google" 
                                  />
                                  Google
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {review.relativeTimeDescription || getTimeAgo(review.time)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                            {[...Array(5)].map((_, j) => (
                              <Star 
                                key={j} 
                                size={14} 
                                className={j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {review.text}
                        </p>
                        {review.text && review.text.length > 200 && (
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${placeId}`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2 hover:underline"
                          >
                            Leer más en Google
                            <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Botón Ver Más en Google */}
                    {place.googleReviews.length > 10 && (
                      <div className="text-center pt-4">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${placeId}`, '_blank')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                        >
                          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                          Ver las {place.googleReviews.length - 10} reseñas restantes en Google
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {totalReviews === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Sé el primero en dejar una reseña</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              
              {/* Card de Reserva */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-orange-500/10 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 relative z-10">Reserva tu mesa</h3>
                
                {place.website && (
                  <button 
                    onClick={() => window.open(place.website, '_blank')}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-2 relative z-10 mb-3"
                  >
                    <Calendar size={20} /> Reservar mesa
                  </button>
                )}
                
                <p className="text-xs text-gray-400 mt-3 relative z-10">Confirmación instantánea • Sin comisiones</p>
              </div>

              {/* Card de Acciones */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg shadow-gray-200/50">
                <h3 className="font-bold text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  {place.website && (
                    <button 
                      onClick={() => window.open(place.website, '_blank')}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Globe size={18} /> Visitar web
                    </button>
                  )}
                  {place.lat && place.lng && (
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank')}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Navigation size={18} /> Cómo llegar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}