import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshSession, logoutServer } from '../../store/slices/authSlice';

const INACTIVITY_WINDOW_MS = 20 * 60 * 1000; // 20 minutes (match server)

export default function SessionManager() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const timerRef = useRef(null);

  useEffect(() => {
    // Bootstrap session on initial load (if refresh cookie exists)
    dispatch(refreshSession());
  }, [dispatch]);

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const arm = () => {
      clear();
      if (!user) return;
      timerRef.current = setTimeout(() => {
        dispatch(logoutServer());
      }, INACTIVITY_WINDOW_MS);
    };

    const onActivity = () => arm();

    // When user logs in/out, re-arm timer
    arm();

    window.addEventListener('mousemove', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });

    return () => {
      clear();
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('scroll', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [dispatch, user]);

  return null;
}

