import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "./queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
  });

  useEffect(() => {
    if (data && typeof data === 'object' && 'authenticated' in data) {
      setIsAuthenticated((data as { authenticated: boolean }).authenticated);
    }
  }, [data]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password, rememberMe }: { username: string; password: string; rememberMe: boolean }) => {
      const res = await apiRequest("POST", "/api/auth/login", { username, password, rememberMe });
      return res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });

  const login = async (username: string, password: string, rememberMe: boolean) => {
    await loginMutation.mutateAsync({ username, password, rememberMe });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
