import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { CartProvider } from '../hooks/useCart';
import { ActivityIndicator, View } from 'react-native';

function Gate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não estiver logado, redireciona para login
        if (segments[1] !== 'auth') {
          router.replace('/(auth)/login');
        }
      } else {
        // Se estiver logado, redireciona para produtos
        if (segments[1] !== 'user') {
          router.replace('/(user)/products');
        }
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Gate />
      </CartProvider>
    </AuthProvider>
  );
}