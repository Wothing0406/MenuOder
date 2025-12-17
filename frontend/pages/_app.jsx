import '../styles/globals.css';
import 'react-easy-crop/react-easy-crop.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../lib/store';
import api from '../lib/api';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token || !user) return;
    if (user.role === 'admin') return;

    // Chỉ chạy notifier cho khu vực dashboard (mọi tab)
    if (!router.pathname.startsWith('/dashboard')) return;

    let isMounted = true;
    let timer = null;

    const makeBeep = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 880;
        g.gain.value = 0.06;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => {
          o.stop();
          ctx.close();
        }, 220);
      } catch {
        // ignore
      }
    };

    const notifyOrders = (newOrders) => {
      if (!newOrders || newOrders.length === 0) return;
      const dineIn = newOrders.filter(o => o.orderType === 'dine_in').length;
      const delivery = newOrders.filter(o => o.orderType === 'delivery').length;
      const msg =
        `Có ${newOrders.length} đơn hàng mới` +
        (delivery ? ` (${delivery} giao hàng)` : '') +
        (dineIn ? ` (${dineIn} tại bàn)` : '');

      toast.success(msg, { duration: 5000 });
      makeBeep();
    };

    const poll = async () => {
      try {
        const res = await api.get('/orders/my-store/list?limit=50');
        if (!isMounted) return;
        if (res.data.success) {
          const list = res.data.data.orders || [];
          const prev = new Set(JSON.parse(localStorage.getItem('seenOrderIds') || '[]'));
          const newOnes = list.filter(o => !prev.has(o.id));

          // Lần đầu vào dashboard: chỉ lưu, không spam thông báo
          const hasInit = localStorage.getItem('ordersNotifierInit') === '1';
          if (hasInit) {
            notifyOrders(newOnes);
          } else {
            localStorage.setItem('ordersNotifierInit', '1');
          }

          // Update seen IDs (keep last 200)
          const next = Array.from(new Set([...list.map(o => o.id), ...Array.from(prev)]));
          localStorage.setItem('seenOrderIds', JSON.stringify(next.slice(0, 200)));
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          timer = setTimeout(poll, 8000);
        }
      }
    };

    poll();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [token, user, router.pathname]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;
