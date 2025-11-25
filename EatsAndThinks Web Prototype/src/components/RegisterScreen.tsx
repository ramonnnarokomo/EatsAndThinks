import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "../context/AuthContext";
import { UtensilsCrossed, User, Mail, Lock, Sparkles } from "lucide-react";

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(nombre, email, password);
      // ⚠️ NOTA: En modo demo acepta cualquier credencial
      // La lógica real de API está comentada en AuthContext.tsx
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Error en registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-teal-50/30 to-orange-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 text-orange-600">
            <UtensilsCrossed className="w-10 h-10" />
            <h1 className="text-3xl">Eats and Thinks</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl text-gray-800 mb-2">Únete a la comunidad</h2>
              <p className="text-gray-500">Crea tu cuenta y comienza a explorar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="nombre" className="text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre completo
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  className="mt-1.5 h-12 rounded-xl border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className="mt-1.5 h-12 rounded-xl border-gray-300 focus:border-teal-400 focus:ring-teal-400"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="mt-1.5 h-12 rounded-xl border-gray-300 focus:border-teal-400 focus:ring-teal-400"
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
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando cuenta...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Crear cuenta gratis
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-gray-600 hover:text-teal-600 transition-colors"
              >
                ¿Ya tienes cuenta? <span className="font-semibold underline">Inicia sesión</span>
              </button>
            </div>

            {/* Beneficios */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">Al registrarte obtendrás:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>Acceso a miles de reseñas auténticas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>Guarda tus restaurantes favoritos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>Comparte tus propias experiencias</span>
                </div>
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

      {/* Panel derecho - Imagen decorativa */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-orange-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <h2 className="text-5xl mb-6 text-center">
            Tu próxima gran<br/>experiencia gastronómica<br/>te espera
          </h2>
          <p className="text-xl text-center max-w-lg opacity-95">
            Únete a nuestra comunidad de amantes de la buena comida y descubre lugares increíbles
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">10K+</div>
              <div className="text-white/90">Restaurantes</div>
            </div>
            <div>
              <div className="text-4xl mb-2">50K+</div>
              <div className="text-white/90">Reseñas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
