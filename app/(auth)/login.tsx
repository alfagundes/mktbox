import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  async function handle() {
    const ok = await login(email, senha);
    if (ok) {
      router.replace('/(user)/products');
    }
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Login</Text>
      
      <TextInput 
        style={styles.inp} 
        placeholder="E-mail" 
        value={email}
        autoCapitalize='none' 
        keyboardType='email-address'
        onChangeText={setEmail}
      />
      
      <TextInput 
        style={styles.inp} 
        placeholder="Senha" 
        value={senha}
        secureTextEntry 
        onChangeText={setSenha}
      />
      
      <Button title="Entrar" onPress={handle} />

      {/* Botão de criar conta adicionado aqui, após o botão de login */}
      <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  ttl: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  inp: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    padding: 10, 
    marginBottom: 10 
  },
  // Novo estilo para o link "Criar conta"
  link: { 
    color: '#007AFF', 
    marginTop: 10, 
    textAlign: 'center' 
  }
});