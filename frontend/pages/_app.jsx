import '../styles/globals.css';
import 'react-easy-crop/react-easy-crop.css';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../lib/store';
import api from '../lib/api';
import toast from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { token, user, store, setToken, setUser, setStore, initDeviceId, logout, isHydrated } = useStore();
  const notifierStartedRef = useRef(false);

  useEffect(() => {
    // Initialize device ID
    initDeviceId();

    // Only restore auth after store has been hydrated from localStorage
    if (!isHydrated) return;

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
  }, [isHydrated]); // Run when hydrated state changes

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token || !user) return;
    if (user.role === 'admin') return;

    // Guard tránh chạy 2 lần trong dev (React StrictMode)
    if (notifierStartedRef.current) return;
    notifierStartedRef.current = true;

    let isMounted = true;
    let timer = null;
    let baselineSet = false;

    const speak = (text) => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return;
        // Cancel previous speech to avoid stacking
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'vi-VN';
        utter.rate = 1;
        synth.speak(utter);
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
      // Voice (giống cơ chế trước đây)
      if (delivery && dineIn) {
        speak('Bạn có một đơn hàng mới. Có đơn giao hàng và đơn tại bàn.');
      } else if (delivery) {
        speak('Bạn có một đơn hàng mới. Đơn giao hàng.');
      } else if (dineIn) {
        speak('Bạn có một đơn hàng mới. Đơn tại bàn.');
      } else {
        speak('Bạn có một đơn hàng mới.');
      }
    };

    const isInDashboard = () => window.location.pathname.startsWith('/dashboard');

    const poll = async () => {
      try {
        // Chỉ poll/notify khi đang ở dashboard (mọi tab). Nếu rời dashboard thì pause.
        if (!isInDashboard()) return;

        const res = await api.get('/orders/my-store/list?limit=50');
        if (!isMounted) return;
        if (res.data.success) {
          const list = res.data.data.orders || [];
          const prev = new Set(JSON.parse(localStorage.getItem('seenOrderIds') || '[]'));
          const newOnes = list.filter(o => !prev.has(o.id));

          // Lần đầu bắt đầu notifier trong phiên: chỉ lưu baseline, không spam (tránh notify lại khi vừa chuyển tab/trang trong dashboard)
          if (baselineSet) {
            notifyOrders(newOnes);
          } else {
            baselineSet = true;
          }

          // Update seen IDs (keep last 200)
          const next = Array.from(new Set([...list.map(o => o.id), ...Array.from(prev)]));
          localStorage.setItem('seenOrderIds', JSON.stringify(next.slice(0, 200)));
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          // Nếu không ở dashboard, vẫn lên lịch lại để khi quay lại dashboard sẽ hoạt động tiếp
          timer = setTimeout(poll, 8000);
        }
      }
    };

    poll();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      notifierStartedRef.current = false;
    };
  }, [token, user]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}

export default MyApp;
