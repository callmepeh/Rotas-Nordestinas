"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsInitialized(true);
  }, []);

  const register = async (data: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        return { success: true, message: result.message };
      }
      return { success: false, message: result.error || "Erro ao cadastrar" };
    } catch (err) {
      return { success: false, message: "Erro ao cadastrar" };
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  const value = {
    isAuthenticated: !!user,
    user,
    token,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
