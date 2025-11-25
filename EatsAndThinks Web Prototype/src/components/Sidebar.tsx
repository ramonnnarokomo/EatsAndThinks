import { Home, Search, User, Heart, UtensilsCrossed, LogOut } from 'lucide-react';
import { Separator } from './ui/separator';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function Sidebar({ currentScreen, onNavigate, onLogout }: SidebarProps) {
  const isGuest = localStorage.getItem('guestMode') === 'true';
  
  const allMenuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'favorites', label: 'Favoritos', icon: Heart, requiresAuth: true },
    { id: 'profile', label: 'Mi Perfil', icon: User, requiresAuth: true },
  ];

  const menuItems = allMenuItems.filter(item => !item.requiresAuth || !isGuest);

  return (
    <div className="w-64 h-screen bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
              EatsAndThinks
            </h1>
            <p className="text-xs text-gray-500 italic">Ponle palabras a tu paladar</p>
          </div>
        </div>
      </div>
      <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-all duration-700 ${
                    isActive ? 'translate-x-full group-hover:translate-x-full' : '-translate-x-full group-hover:translate-x-full'
                  }`}></div>
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <LogOut className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
          <span className="relative z-10 font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
