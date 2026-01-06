import React, { createContext, useState, useEffect, useContext, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { Platform } from 'react-native';

// --- CONFIGURATION ---
// 10.0.2.2 is the GLOBAL bridge IP for Android Emulators to reach your PC.
// 'localhost' is for iOS. 
// No more manual IP changes!
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin'|'user' | 'consultant';
  profilePicture: string;
  expertise: string[];
  bio: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  socket: Socket | null;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  axiosInstance: (token: string) => typeof axios;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const axiosInstance = useMemo(() => {
    return (authToken: string) => axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    });
  }, []);

  const connectSocket = (authToken: string) => {
    if (!authToken || socketRef.current?.connected) return;
    socketRef.current = io(BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      forceNew: true,
    });
    socketRef.current.on('connect', () => {
        socketRef.current?.emit('authenticate', { token: authToken });
    });
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const saveAuthData = async (newToken: string, newUser: User) => {
    try {
        await AsyncStorage.setItem('userToken', newToken);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        connectSocket(newToken);
    } catch (e) {
        console.error('Save Data Error', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      await saveAuthData(res.data.token, res.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Login failed.';
      throw new Error(msg);
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      await saveAuthData(res.data.token, res.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    disconnectSocket();
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          connectSocket(storedToken);
        }
      } catch (e) {
        console.error('Load Auth Error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
    return () => disconnectSocket();
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    socket: socketRef.current,
    login,
    register,
    logout,
    setUser,
    axiosInstance
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};