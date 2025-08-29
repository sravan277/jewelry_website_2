import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axiosInstance.get('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser({ email: response.data.email });
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      
      if (!response.data.data?.token || !response.data.data?.user?.email) {
        throw new Error('Invalid response format from server');
      }
      
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser({ email: user.email });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        email,
        password,
        name
      });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser({ email: user.email });
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join('. ');
        throw new Error(errorMessages);
      }
      
      // Then check for other specific backend messages (like "Email is already registered")
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
  
      // Fallback for generic errors
      throw new Error('Registration failed. Please try again.');

    }


  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
