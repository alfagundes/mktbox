// src/app/_layout.tsx
import { Slot } from 'expo-router';
import { AuthProvider } from '../hooks/useAuth';
import { CartProvider } from '../hooks/useCart';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Componente que verifica o estado de loading
function Gate() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Slot />;
}

// Layout principal
export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Gate />
      </CartProvider>
    </AuthProvider>
  );
}