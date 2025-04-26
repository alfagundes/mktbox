import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    Alert.alert('Logout', 'Você saiu do aplicativo.');
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.label}>E-mail:</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <Text style={styles.label}>Tipo de usuário:</Text>
      <Text style={styles.value}>{user?.role}</Text>
      <Button title="Sair" color="#FF3B30" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 16 },
  value: { marginBottom: 8, fontSize: 16 },
});