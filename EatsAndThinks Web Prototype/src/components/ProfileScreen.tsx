import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent } from './ui/dialog';
import { Star, Mail, Calendar, Edit, Trash2, Award, TrendingUp, MapPin, X, Utensils, CheckCircle, Sparkles, Heart, Flame, Trophy, Target, Zap, Crown } from 'lucide-react';
import { getCurrentUser, getUserReviews, updateUser, UserData } from '../services/users';
import { ReviewDto, updateReview, deleteReview } from '../services/reviews';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip, YAxis } from 'recharts';
import { AdminPanel } from './AdminPanel';

export function ProfileScreen() {
  // ============================================
  // ⚙️ LÓGICA (INTACTA)
  // ============================================
  const [userData, setUserData] = useState<UserData | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'REVIEWS' | 'STATS'>('REVIEWS');

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setUserData(user);
      setEditName(user.nombre || '');
      setEditEmail(user.email || '');
      const userReviews = await getUserReviews();
      setReviews(userReviews);
    } catch (error) { console.error(error); alert('Error al cargar datos del perfil'); } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
   try {
     setSaving(true);
     const response = await updateUser({ nombre: editName, email: editEmail });
     setShowEditProfile(false);
     
     // 🔥 SI EL EMAIL CAMBIÓ, HACER LOGOUT
     if (response.emailChanged) {
       alert('✅ Perfil actualizado. Por seguridad, debes iniciar sesión nuevamente con tu nuevo email.');
       logout();
       return;
     }
     
     alert('✅ Perfil actualizado correctamente');
     await loadUserData();
   } catch (error: any) { 
     alert('❌ Error al actualizar perfil'); 
   } finally { 
     setSaving(false); 
   }
 };
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(r => r.reviewId !== reviewId));
      alert('✅ Reseña eliminada');
      loadUserData();
    } catch (error) { alert('❌ Error al eliminar reseña'); }
  };

  const handleUpdateReview = async (reviewId: number) => {
    try {
      await updateReview(reviewId, { puntuacion: editRating, comentario: editComment });
      setEditingReview(null);
      alert('✅ Reseña actualizada');
      loadUserData();
    } catch (error) { alert('❌ Error al actualizar reseña'); }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
    try { return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return dateString; }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-spin mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-500 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }
  
  if (!userData) return <div>Error</div>;

  // Si es ADMIN, mostrar panel de administración
  if (userData.role === 'ADMIN' || userData.role === 'ROLE_ADMIN') {
    return <AdminPanel />;
  }

  const userName = userData.nombre || userData.email.split('@')[0];
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const totalReviews = userData.totalReviews || reviews.length;
  const averageRating = userData.avgRating || (reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviews.length).toFixed(1) : '0.0');
  const ratingData = [1,2,3,4,5].map(star => ({ name: `${star}★`, count: reviews.filter(r => r.puntuacion === star).length }));

  // ============================================
  // 🎨 UI ULTRA PREMIUM
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-purple-50/20 pb-24">
      
      {/* HERO SECTION CON PARALLAX */}
      <div className="relative h-[450px] overflow-hidden mb-20">
        {/* Background con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700"></div>
        
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Orbs flotantes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-300/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Efecto shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

        {/* Contenido del hero */}
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center z-10">
          <div className="animate-fade-in-up">
            {/* Badge de miembro */}
            <Badge className="bg-white/20 backdrop-blur-xl text-white border border-white/30 mb-6 px-6 py-2.5 rounded-full shadow-2xl shadow-black/20 inline-flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-300" />
              <span className="font-bold tracking-wide">MEMBER SINCE {new Date(userData.createdAt || Date.now()).getFullYear()}</span>
            </Badge>

            {/* Avatar con halo animado */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full blur-2xl opacity-60 animate-pulse scale-110"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-spin-slow opacity-30" style={{ animation: 'spin 8s linear infinite' }}></div>
              
              <Avatar className="w-40 h-40 border-[6px] border-white shadow-2xl shadow-black/30 relative z-10">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-600 text-white text-5xl font-black">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* Badge de logro */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full border-4 border-white shadow-xl z-20 animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-white" />
                  <span className="font-black text-white text-sm">PRO FOODIE</span>
                </div>
              </div>
            </div>

            {/* Nombre */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
              {userName}
            </h1>
            
            {/* Email */}
            <div className="flex items-center justify-center gap-2 text-white/90 text-lg mb-8 backdrop-blur-sm bg-white/10 px-6 py-3 rounded-full border border-white/20">
              <Mail className="w-5 h-5" />
              <span className="font-medium">{userData.email}</span>
            </div>

            {/* Stats principales */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: Utensils, label: 'Reviews', value: totalReviews, color: 'from-orange-400 to-red-500' },
                { icon: Star, label: 'Avg Rating', value: averageRating, color: 'from-yellow-400 to-orange-500' },
                { icon: Flame, label: 'Impact', value: 'High', color: 'from-pink-400 to-purple-500' }
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  className="group bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-8 py-4 hover:bg-white/30 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-3xl font-black text-white">{stat.value}</div>
                      <div className="text-xs text-white/80 uppercase tracking-widest font-bold">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Degradado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        
        {/* Badges de logros */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🏆', title: 'Top Reviewer', desc: 'Más de 10 reseñas', color: 'from-yellow-400 to-orange-500' },
            { icon: '⭐', title: 'Quality Expert', desc: 'Rating promedio 4.5+', color: 'from-blue-400 to-cyan-500' },
            { icon: '🔥', title: 'Trending', desc: 'Reseñas populares', color: 'from-pink-400 to-red-500' },
            { icon: '💎', title: 'Gem Hunter', desc: 'Descubre lugares nuevos', color: 'from-purple-400 to-pink-500' }
          ].map((badge, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-3xl mb-4 shadow-xl group-hover:scale-110 transition-transform mx-auto`}>
                {badge.icon}
              </div>
              <h4 className="font-bold text-gray-900 text-center mb-1">{badge.title}</h4>
              <p className="text-xs text-gray-500 text-center">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* Controles de perfil */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={() => setShowEditProfile(true)}
            className="flex-1 md:flex-none bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 rounded-2xl h-14 px-8 font-bold shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Edit className="w-5 h-5 mr-2" /> Editar Perfil
          </Button>
          
          <Button 
            onClick={logout}
            variant="outline"
            className="flex-1 md:flex-none border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl h-14 px-8 font-bold transition-all"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* TABS */}
        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl border border-gray-200 inline-flex gap-2 shadow-xl mb-8">
          <button 
            onClick={() => setActiveTab('REVIEWS')}
            className={`relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeTab === 'REVIEWS' 
              ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Utensils className="w-5 h-5 inline mr-2" />
            Mis Reseñas
            {activeTab === 'REVIEWS' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('STATS')}
            className={`relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
              activeTab === 'STATS' 
              ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Analíticas
          </button>
        </div>

        {/* CONTENIDO DE TABS */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 min-h-[600px]">
          
          {activeTab === 'STATS' ? (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Distribución de Valoraciones</h3>
                  <p className="text-gray-500">Análisis de tus últimas {reviews.length} reseñas</p>
                </div>
              </div>

              {/* Gráfico mejorado */}
              <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-3xl p-8 border-2 border-gray-100">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 14, fill: '#64748b', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(249, 115, 22, 0.1)', radius: 12 }}
                        contentStyle={{ 
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          padding: '16px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Bar dataKey="count" radius={[16, 16, 0, 0]} barSize={60}>
                        {ratingData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#gradient${index})`}
                          />
                        ))}
                      </Bar>
                      <defs>
                        {ratingData.map((_, index) => (
                          <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={index >= 3 ? '#f97316' : '#e5e7eb'} />
                            <stop offset="100%" stopColor={index >= 3 ? '#ec4899' : '#f3f4f6'} />
                          </linearGradient>
                        ))}
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats adicionales */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-6 border-2 border-orange-100">
                  <Target className="w-10 h-10 text-orange-500 mb-4" />
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {reviews.filter(r => r.puntuacion >= 4).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Reseñas Positivas</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-100">
                  <Zap className="w-10 h-10 text-purple-500 mb-4" />
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {reviews.length > 0 ? Math.round((reviews.filter(r => r.puntuacion >= 4).length / reviews.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Tasa de Satisfacción</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border-2 border-blue-100">
                  <Sparkles className="w-10 h-10 text-blue-500 mb-4" />
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {reviews.filter(r => r.puntuacion === 5).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Experiencias Perfectas</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              {reviews.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-xl">
                    🍽️
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Sin reseñas todavía</h3>
                  <p className="text-gray-500 text-lg max-w-md mx-auto">
                    Empieza a explorar restaurantes y comparte tus experiencias con la comunidad
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline vertical */}
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-pink-500 to-purple-500 rounded-full hidden md:block"></div>
                  
                  <div className="space-y-8">
                    {reviews.map((review, idx) => (
                      <div 
                        key={review.reviewId} 
                        className="relative group animate-fade-in-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {/* Punto del timeline */}
                        <div className="absolute left-[26px] top-8 w-6 h-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full border-4 border-white shadow-xl z-10 hidden md:block group-hover:scale-125 transition-transform"></div>

                        {editingReview === review.reviewId ? (
                          <div className="md:ml-20 bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                              <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-orange-500" />
                                Editando reseña...
                              </h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingReview(null)}
                                className="rounded-xl hover:bg-white"
                              >
                                <X className="w-5 h-5"/>
                              </Button>
                            </div>
                            
                            <div className="flex gap-2 p-6 bg-white rounded-2xl justify-center mb-6 border-2 border-orange-100">
                              {[1,2,3,4,5].map(s => (
                                <Star 
                                  key={s} 
                                  className={`cursor-pointer w-10 h-10 transition-all hover:scale-125 ${
                                    s <= editRating 
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' 
                                    : 'text-gray-200 hover:text-gray-300'
                                  }`}
                                  onClick={() => setEditRating(s)}
                                />
                              ))}
                            </div>
                            
                            <textarea 
                              className="w-full p-6 bg-white rounded-2xl border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all resize-none font-medium"
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              rows={5}
                              placeholder="Comparte tu experiencia..."
                            />
                            
                            <div className="flex justify-end gap-3 mt-6">
                              <Button 
                                onClick={() => handleUpdateReview(review.reviewId!)} 
                                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 rounded-2xl px-8 h-12 font-bold shadow-xl shadow-orange-500/30"
                              >
                                Guardar Cambios
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="md:ml-20 bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-start gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 flex-shrink-0">
                                  {review.restaurantName ? review.restaurantName[0] : <Utensils className="w-8 h-8"/>}
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
                                    {review.restaurantName || 'Restaurante'}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4 text-orange-500" /> 
                                      {formatDate(review.fecha)}
                                    </span>
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    <Badge className="bg-green-100 text-green-700 border-0 rounded-lg px-2 py-0.5 text-xs">
                                      <CheckCircle className="w-3 h-3 inline mr-1"/> Verificado
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-3 rounded-2xl border-2 border-yellow-200 flex items-center gap-2 shadow-lg">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-black text-orange-600 text-xl">{review.puntuacion}</span>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 p-6 rounded-2xl border border-gray-100 mb-6">
                              <p className="text-gray-700 leading-relaxed font-medium">
                                "{review.comentario}"
                              </p>
                            </div>
                            
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button 
                                onClick={() => { 
                                  setEditingReview(review.reviewId!); 
                                  setEditComment(review.comentario); 
                                  setEditRating(review.puntuacion); 
                                }}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all hover:scale-105"
                              >
                                <Edit className="w-4 h-4" /> Editar
                              </button>
                              <button 
                                onClick={() => review.reviewId && handleDeleteReview(review.reviewId)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all hover:scale-105"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDICIÓN */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl max-w-lg">
          <div className="relative bg-gradient-to-br from-orange-500 via-pink-600 to-purple-600 p-10 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 border border-white/30">
                <Edit className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black mb-2">Editar Perfil</h2>
              <p className="text-white/80 font-medium">Actualiza tu información personal</p>
            </div>
          </div>
          
          <div className="p-10 space-y-6 bg-white">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Nombre Completo</label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="h-14 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 font-medium" 
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
              <Input 
                value={editEmail} 
                onChange={(e) => setEditEmail(e.target.value)} 
                className="h-14 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 font-medium" 
              />
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowEditProfile(false)} 
                className="flex-1 h-14 rounded-2xl border-2 font-bold hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving} 
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 font-bold shadow-xl shadow-orange-500/30"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}