import { createContext, useState } from 'react';
import api from '../api/axios';
import { deriveMasterKey } from '../utils/crypto';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [masterKey, setMasterKey] = useState(null);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      // 1. Save normal data to browser storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 2. GENERATE THE VAULT KEY! 
      // We use the raw password + the salt from the server
      const derivedKey = deriveMasterKey(password, res.data.user.salt);

      // 3. Save it to React State (RAM) so the Dashboard can use it!
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

  // 3. Register Function
  const register = async (email, password) => {
    try {
      // FIXED: Removed 'const res =' since we don't use 'res' here
      await api.post('/auth/register', { email, password });
      return { success: true }; // Don't auto-login, let them login manually
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMasterKey(null);
  };

  return (
    // We pass loading: false explicitly since we aren't waiting for anything anymore
    <AuthContext.Provider value={{ user, masterKey, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};