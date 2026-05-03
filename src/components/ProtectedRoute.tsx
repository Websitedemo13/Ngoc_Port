import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verify = async (userId: string | undefined) => {
      if (!userId) {
        if (mounted) { setIsAdmin(false); setLoading(false); }
        return;
      }
      try {
        const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
        if (mounted) { setIsAdmin(!!data); setLoading(false); }
      } catch {
        if (mounted) { setIsAdmin(false); setLoading(false); }
      }
    };

    // Subscribe FIRST to avoid race
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer to avoid running supabase calls inside the callback synchronously
      setTimeout(() => verify(session?.user?.id), 0);
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      verify(session?.user?.id);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
