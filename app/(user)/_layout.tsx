import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

export default function PrivateLayout(){
  const { user } = useAuth();
  const router = useRouter();

  useEffect(()=>{
    if(!user) router.replace('/(auth)/login');
  },[user]);

  return <Stack/>;
}