import '../styles/globals.css';
import 'react-easy-crop/react-easy-crop.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../lib/store';
import api from '../lib/api';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { token, user, store, setToken, setUser, setStore, initDeviceId, logout } = useStore();

  useEffect(() => {
    // Initialize device ID
    initDeviceId();

    // Restore authentication from localStorage on app load
    const restoreAuth = async () => {
      if (typeof window === 'undefined') return;

      // Get token from localStorage (backup check)
      const storedToken = localStorage.getItem('token');
      
      // If we have token in localStorage but not in store, sync it
      if (storedToken && !token) {
        setToken(storedToken);
      }

      // If we have token, verify it and restore user data
      const currentToken = token || storedToken;
      if (currentToken) {
        // If user data is missing, fetch it
        if (!user || !store) {
          try {
            // Verify token by getting profile
            const res = await api.get('/auth/profile');
            if (res.data.success) {
              setUser(res.data.data.user);
              setStore(res.data.data.store);
              // Ensure token is synced
              if (!token) {
                setToken(currentToken);
              }
            } else {
              // Token invalid, clear auth
              logout();
            }
          } catch (error) {
            // Token expired or invalid
            if (error.response?.status === 401) {
              logout();
            }
          }
        } else {
          // User data exists, verify token is still valid (silent check)
          try {
            await api.get('/auth/profile');
          } catch (error) {
            if (error.response?.status === 401) {
              logout();
            }
          }
        }
      }
    };

    restoreAuth();

    // Listen for logout events
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;
