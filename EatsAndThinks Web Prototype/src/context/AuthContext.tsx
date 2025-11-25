// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiRegister } from "../services/auth";
import api from "../services/api";

type UserMinimal = { email?: string } | null;

interface AuthContextValue {
  user: UserMinimal;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("jwtToken"));
  const [user, setUser] = useState<UserMinimal>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("jwtToken", token);
    else localStorage.removeItem("jwtToken");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.jwtToken);
    setUser({ email });
  };

  const register = async (nombre: string, email: string, password: string) => {
    const res = await apiRegister(nombre, email, password);
    setToken(res.jwtToken);
    setUser({ email });
  };

  const logout = async () => {
    try {
      // Llamar al backend para eliminar invitado si aplica
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.removeItem("guestMode");
      localStorage.removeItem("userEmail");
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}