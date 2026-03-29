import { createContext, useState } from 'react';
import api from '../api/axios';
import { deriveMasterKey } from '../utils/crypto';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [masterKey, setMasterKey] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const derivedKey = deriveMasterKey(password, res.data.user.salt);

      setMasterKey(derivedKey); 
      setUser(res.data.user);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      await api.post('/auth/register', { email, password });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMasterKey(null);
  };

  return (
    
    <AuthContext.Provider value={{ user, masterKey, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};