import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';

// Create a context for authentication
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user data from the server if token is present
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Object to be provided to consuming components (returned by useContext)
  const value = {
    user,
    loading,
    setUser: (userData) => {
      if (userData?.token) {
        localStorage.setItem('token', userData.token);
      }
      setUser(userData);
    },
    logout: () => {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); // useContext returns "value" of the provider which is actually returned here "() => { return value }" forming it a custom hook.