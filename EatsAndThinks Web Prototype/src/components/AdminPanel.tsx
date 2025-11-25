import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Shield, Users, Trash2, Ban, CheckCircle, XCircle, Crown, MapPin, Plus, Search, MessageSquare, Star, Calendar, User as UserIcon, Image as ImageIcon, Info } from 'lucide-react';
import { getAllUsers, changeUserRole, toggleBanUser, toggleReviewPermission, deleteUser, AdminUser, createLocal, getSystemStats, SystemStats } from '../services/admin';
import { getUserReviews } from '../services/users';
import { deleteReview, ReviewDto } from '../services/reviews';
import api from '../services/api';
import { toast } from 'react-toastify';

export function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateLocal, setShowCreateLocal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'reviews' | 'create'>('users');
  const [allReviews, setAllReviews] = useState<ReviewDto[]>([]);
  const [creatingLocal, setCreatingLocal] = useState(false);
  
  const [newLocal, setNewLocal] = useState({
    nombre: '',
    direccion: '',
    tipo: 'restaurant',
    lat: 40.4168,
    lng: -3.7038,
    priceLevel: 2,
    photoUrl: '',
    descripcion: '',
    telefono: '',
    website: '',
    horario: '',
    rating: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [userSearch, users]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getSystemStats()
      ]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setStats(statsData);
      
      // Cargar todas las reseñas
      console.log('🔍 Cargando reseñas de', usersData.length, 'usuarios...');
      const allUserReviews: ReviewDto[] = [];
      
      for (const user of usersData) {
        try {
          console.log(`📥 Cargando reseñas del usuario ${user.id} (${user.nombre})...`);
          const reviews = await api.get(`/users/${user.id}/reviews`);
          console.log(`✅ Reseñas de ${user.nombre}:`, reviews.data);
          
          if (reviews.data && Array.isArray(reviews.data)) {
            const reviewsWithUser = reviews.data.map((r: any) => ({
              ...r,
              userName: user.nombre,
              userEmail: user.email
            }));
            allUserReviews.push(...reviewsWithUser);
            console.log(`➕ Agregadas ${reviewsWithUser.length} reseñas de ${user.nombre}`);
          }
        } catch (error: any) {
          console.error(`❌ Error cargando reseñas de usuario ${user.id}:`, error.response?.data || error.message);
        }
      }
      
      console.log('✅ Total de reseñas cargadas:', allUserReviews.length);
      setAllReviews(allUserReviews);
    } catch (error) {
      console.error('Error cargando datos admin:', error);
      toast.error('Error al cargar datos de administración');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!userSearch) {
      setFilteredUsers(users);
      return;
    }
    const search = userSearch.toLowerCase();
    const filtered = users.filter(u => 
      u.nombre.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search)
    );
    setFilteredUsers(filtered);
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await changeUserRole(userId, role);
      toast.success(`✅ Rol cambiado a ${role}`);
      loadData();
    } catch (error) {
      toast.error('❌ Error al cambiar rol');
    }
  };

  const handleToggleBan = async (userId: number, currentBanned: boolean) => {
    if (!confirm(`¿${currentBanned ? 'Desbanear' : 'Banear'} a este usuario?`)) return;
    try {
      await toggleBanUser(userId, !currentBanned);
      toast.success(currentBanned ? '✅ Usuario desbaneado' : '⛔ Usuario baneado');
      loadData();
    } catch (error) {
      toast.error('❌ Error al actualizar estado');
    }
  };

  const handleToggleReviewPermission = async (userId: number, currentCan: boolean) => {
    try {
      await toggleReviewPermission(userId, !currentCan);
      toast.success(currentCan ? '🚫 Permisos de reseña revocados' : '✅ Permisos de reseña otorgados');
      loadData();
    } catch (error) {
      toast.error('❌ Error al actualizar permisos');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('⚠️ ¿ELIMINAR este usuario permanentemente? Esta acción no se puede deshacer.')) return;
    try {
      await deleteUser(userId);
      toast.success('✅ Usuario eliminado');
      loadData();
    } catch (error: any) {
      toast.error('❌ ' + (error.response?.data?.message || 'Error al eliminar usuario'));
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('⚠️ ¿Eliminar esta reseña?')) return;
    try {
      await deleteReview(reviewId);
      toast.success('✅ Reseña eliminada');
      loadData();
    } catch (error) {
      toast.error('❌ Error al eliminar reseña');
    }
  };

  const handleCreateLocal = async () => {
    if (!newLocal.nombre || !newLocal.direccion) {
      toast.warning('⚠️ Nombre y dirección son obligatorios');
      return;
    }
    
    if (creatingLocal) return; // Prevenir doble click
    
    try {
      setCreatingLocal(true);
      const localData: any = {
        nombre: newLocal.nombre,
        direccion: newLocal.direccion,
        tipo: newLocal.tipo,
        lat: newLocal.lat,
        lng: newLocal.lng,
        priceLevel: newLocal.priceLevel
      };
      
      if (newLocal.photoUrl) localData.photoRef = newLocal.photoUrl;
      if (newLocal.rating > 0) localData.rating = newLocal.rating;
      
      await createLocal(localData);
      toast.success('✅ Local creado correctamente');
      setShowCreateLocal(false);
      setNewLocal({ 
        nombre: '', direccion: '', tipo: 'restaurant', 
        lat: 40.4168, lng: -3.7038, priceLevel: 2,
        photoUrl: '', descripcion: '', telefono: '', website: '', horario: '', rating: 0
      });
    } catch (error: any) {
      console.error('Error creando local:', error);
      toast.error('❌ Error al crear local: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreatingLocal(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">Gestiona usuarios, permisos y contenido de la plataforma</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Total Usuarios</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Locales</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalLocals}</p>
                </div>
                <MapPin className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 mb-1">Administradores</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.adminCount}</p>
                </div>
                <Crown className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 mb-1">Usuarios Baneados</p>
                  <p className="text-3xl font-bold text-red-900">{stats.bannedUsers}</p>
                </div>
                <Ban className="w-12 h-12 text-red-500 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Gestión de Usuarios
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'reviews'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Gestión de Reseñas ({allReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'create'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Crear Local
          </button>
        </div>

        {/* TAB: Gestión de Usuarios */}
        {activeTab === 'users' && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nombre, email o rol..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </p>
            </div>
            
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4 border-2 hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{user.nombre}</p>
                          {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><Crown className="w-3 h-3 mr-1" />ADMIN</Badge>}
                          {user.banned && <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Baneado</Badge>}
                          {!user.canReview && <Badge variant="outline" className="text-red-600 border-red-300">Sin permisos de reseña</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Ocultar controles si es el usuario Administrator protegido */}
                    {(user.nombre === 'Administrator' || user.email === 'admin@gmail.com') ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">Usuario Protegido</span>
                      </div>
                    ) : (
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? 'ADMIN' : user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="GUEST">GUEST</option>
                      </select>
                      
                      <Button
                        size="sm"
                        variant={user.canReview ? "outline" : "default"}
                        onClick={() => handleToggleReviewPermission(user.id, user.canReview)}
                        className={user.canReview ? '' : 'bg-green-500 hover:bg-green-600'}
                        title={user.canReview ? 'Revocar permisos de reseña' : 'Otorgar permisos de reseña'}
                      >
                        {user.canReview ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleBan(user.id, user.banned)}
                        className={user.banned 
                          ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' 
                          : 'hover:bg-red-50 hover:border-red-500 border-gray-300'}
                        title={user.banned ? 'Desbanear usuario' : 'Banear usuario'}
                      >
                        {user.banned ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Ban className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* TAB: Gestión de Reseñas */}
        {activeTab === 'reviews' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-orange-600" />
              Todas las Reseñas ({allReviews.length})
            </h2>
            
            <div className="space-y-4">
              {allReviews.map((review) => (
                <Card key={review.reviewId} className="p-4 border-l-4 border-l-orange-400">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-400 flex items-center justify-center text-white">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{review.userName || review.author || 'Usuario'}</p>
                          <Badge variant="secondary" className="text-xs">{review.userEmail}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{review.restaurantName || 'Local'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(review.fecha)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{review.puntuacion}/5</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => review.reviewId && handleDeleteReview(review.reviewId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comentario}</p>
                </Card>
              ))}
              {allReviews.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay reseñas aún</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* TAB: Crear Local */}
        {activeTab === 'create' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange-600" />
              Crear Local de la Comunidad
            </h2>
            
            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre del Local <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Ej: La Taberna de Madrid"
                      value={newLocal.nombre}
                      onChange={(e) => setNewLocal({ ...newLocal, nombre: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tipo de Local <span className="text-red-500">*</span></Label>
                    <select
                      value={newLocal.tipo}
                      onChange={(e) => setNewLocal({ ...newLocal, tipo: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                    >
                      <option value="restaurant">Restaurante</option>
                      <option value="cafe">Café</option>
                      <option value="bar">Bar</option>
                      <option value="pizzeria">Pizzería</option>
                      <option value="bakery">Panadería</option>
                      <option value="ice_cream">Heladería</option>
                      <option value="fast_food">Comida Rápida</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Dirección Completa <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Ej: Calle Mayor 45, 28013 Madrid"
                      value={newLocal.direccion}
                      onChange={(e) => setNewLocal({ ...newLocal, direccion: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      placeholder="+34 91 234 5678"
                      value={newLocal.telefono}
                      onChange={(e) => setNewLocal({ ...newLocal, telefono: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sitio Web</Label>
                    <Input
                      placeholder="https://ejemplo.com"
                      value={newLocal.website}
                      onChange={(e) => setNewLocal({ ...newLocal, website: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                      placeholder="Describe el local..."
                      value={newLocal.descripcion}
                      onChange={(e) => setNewLocal({ ...newLocal, descripcion: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Latitud <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="40.4168"
                      value={newLocal.lat}
                      onChange={(e) => setNewLocal({ ...newLocal, lat: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Longitud <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder="-3.7038"
                      value={newLocal.lng}
                      onChange={(e) => setNewLocal({ ...newLocal, lng: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2 text-xs text-gray-500">
                    💡 Usa <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Maps</a> para obtener coordenadas exactas
                  </div>
                </div>
              </div>

              {/* Detalles y Rating */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Detalles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nivel de Precio (1-4)</Label>
                    <select
                      value={newLocal.priceLevel}
                      onChange={(e) => setNewLocal({ ...newLocal, priceLevel: parseInt(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300"
                    >
                      <option value={1}>€ - Económico</option>
                      <option value={2}>€€ - Moderado</option>
                      <option value={3}>€€€ - Caro</option>
                      <option value={4}>€€€€ - Muy Caro</option>
                    </select>
                  </div>
                  <div>
                    <Label>Rating Inicial (0-5)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="4.5"
                      value={newLocal.rating || ''}
                      onChange={(e) => setNewLocal({ ...newLocal, rating: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Este rating es temporal hasta que haya reseñas reales
                    </p>
                  </div>
                  <div>
                    <Label>Horario</Label>
                    <Input
                      placeholder="Lun-Vie: 12:00-23:00"
                      value={newLocal.horario}
                      onChange={(e) => setNewLocal({ ...newLocal, horario: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Imagen */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-500" />
                  Imagen del Local
                </h3>
                <div>
                  <Label>URL de la Imagen</Label>
                  <Input
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={newLocal.photoUrl}
                    onChange={(e) => setNewLocal({ ...newLocal, photoUrl: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Esta imagen se usará siempre para este local
                  </p>
                  {newLocal.photoUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                      <img 
                        src={newLocal.photoUrl} 
                        alt="Preview" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleCreateLocal}
                  disabled={!newLocal.nombre || !newLocal.direccion || creatingLocal}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {creatingLocal ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Local
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewLocal({ 
                    nombre: '', direccion: '', tipo: 'restaurant', 
                    lat: 40.4168, lng: -3.7038, priceLevel: 2,
                    photoUrl: '', descripcion: '', telefono: '', website: '', horario: '', rating: 0
                  })}
                >
                  Limpiar Formulario
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
