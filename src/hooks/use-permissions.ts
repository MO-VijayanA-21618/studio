import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { getUser } from '@/lib/firebase/users';
import { UserData } from '@/lib/types/user';

export function usePermissions() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const data = await getUser(user.uid);
        setUserData(data);
      }
      setLoading(false);
    };
    loadUserData();
  }, [user]);

  const hasPermission = (module: 'loans' | 'accounting' | 'users', action: 'create' | 'read' | 'update' | 'delete') => {
    return userData?.permissions?.[module]?.[action] ?? false;
  };

  return { userData, loading, hasPermission };
}
