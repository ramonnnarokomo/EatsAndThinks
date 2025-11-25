// src/components/LoginScreen.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed, Sparkles, ChefHat, UserRound } from "lucide-react";
import { apiGuestLogin } from "../services/auth";

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // ⚠️ NOTA: En modo demo acepta cualquier credencial
      // La lógica real de API está comentada en AuthContext.tsx
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Error en login");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      console.log("🔄 Iniciando sesión de invitado...");
      const response = await apiGuestLogin();
      console.log("✅ Respuesta del servidor:", response);
      
      // Guardar token en localStorage (mismo nombre que usa el login normal)
      localStorage.setItem('jwtToken', response.jwtToken);
      localStorage.setItem('guestMode', 'true');
      
      // Guardar datos de usuario
      const guestUser = {
        email: response.email || 'invitado@eatsandthinks.app',
        role: 'GUEST'
      };
      localStorage.setItem('user', JSON.stringify(guestUser));
      
      console.log("✅ Datos guardados en localStorage");
      
      // Recargar página para que AuthContext detecte el token
      window.location.reload();
    } catch (err: any) {
      console.error("❌ Error en login invitado:", err);
      setError("Error al crear sesión de invitado: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen de fondo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1641924676490-cd948c956b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-orange-500/80 to-teal-600/90" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed className="w-16 h-16" />
            <ChefHat className="w-12 h-12" />
          </div>
          <h1 className="text-5xl mb-4 text-center">
            Eats and Thinks
          </h1>
          <p className="text-xl text-center max-w-md opacity-95">
            Descubre, comparte y disfruta las mejores experiencias gastronómicas
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/90">
            <Sparkles className="w-5 h-5" />
            <span>Reseñas auténticas de comensales reales</span>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50/30 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8 text-orange-600">
            <UtensilsCrossed className="w-10 h-10" />
            <h1 className="text-3xl">Eats and Thinks</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl text-gray-800 mb-2">¡Bienvenido de nuevo!</h2>
              <p className="text-gray-500">Inicia sesión para continuar tu aventura culinaria</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="mt-1.5 h-12 rounded-xl border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                  className="mt-1.5 h-12 rounded-xl border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Entrando...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <UserRound className="w-5 h-5 mr-2" />
                Entrar como invitado
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-gray-600 hover:text-orange-600 transition-colors"
                >
                  ¿No tienes cuenta? <span className="font-semibold underline">Regístrate gratis</span>
                </button>
              </div>
            </div>
          </div>

          {/* Demo notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 bg-white/80 backdrop-blur rounded-xl px-4 py-2 inline-block">
              💡 <span className="font-semibold"><b>Eats & Thinks:</b></span> <i>Ponle palabras a tu paladar</i>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}