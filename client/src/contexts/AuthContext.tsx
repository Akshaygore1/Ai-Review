import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  login: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user`,
        {
          withCredentials: true,
        }
      );
      setUser(response.data);
      navigate("/");
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  };

  const logout = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      setUser(null);
    } catch (err) {
      setError("Failed to logout");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
