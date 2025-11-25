// src/App.tsx
import React, { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { HomeScreen } from "./components/HomeScreen";
import { RestaurantDetailScreen } from "./components/RestaurantDetailScreen";
import { SearchScreen } from "./components/SearchScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { Sidebar } from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import { FavoritesScreen } from './components/FavoritesScreen';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Screen = "login" | "register" | "home" | "detail" | "search" | "profile";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number>(1);

  const { isAuthenticated, logout } = useAuth();

  // Si el usuario está autenticado mostramos home por defecto:
  React.useEffect(() => {
    if (isAuthenticated) setCurrentScreen("home");
    else setCurrentScreen("login");
  }, [isAuthenticated]);

  const handleRestaurantClick = (id: number) => {
    setSelectedRestaurantId(id);
    setCurrentScreen("detail");
  };

  const handleBackFromDetail = () => {
    setCurrentScreen("home");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - ✅ CORREGIDO: agregado currentScreen */}
      {isAuthenticated && (
        <Sidebar 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate} 
          onLogout={logout} 
        />
      )}
      
      <div className="flex-1">
        {currentScreen === "login" && (
          <LoginScreen onNavigateToRegister={() => setCurrentScreen("register")} />
        )}
        {currentScreen === "register" && (
          <RegisterScreen onNavigateToLogin={() => setCurrentScreen("login")} />
        )}
        {currentScreen === "home" && <HomeScreen onRestaurantClick={handleRestaurantClick} />}
        {currentScreen === "search" && <SearchScreen onRestaurantClick={handleRestaurantClick} />}
        {currentScreen === "favorites" && <FavoritesScreen onRestaurantClick={handleRestaurantClick} />}
        {currentScreen === "profile" && <ProfileScreen onRestaurantClick={handleRestaurantClick} />}
        {currentScreen === "detail" && selectedRestaurantId && (
          <RestaurantDetailScreen placeId={selectedRestaurantId} onBack={handleBackFromDetail} />
        )}
      </div>
      
      {/* Toast Container para notificaciones */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </div>
  );
}