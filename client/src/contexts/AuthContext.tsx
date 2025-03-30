import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Repo {
  name: string;
  url: string;
}
interface User {
  name: string;
  username: string;
  repos_url: string;
  repos: Repo[];
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
      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch user");
      } else {
        setError("An unexpected error occurred");
      }
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
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch user");
      } else {
        setError("An unexpected error occurred");
      }
      setError("Failed to logout");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
