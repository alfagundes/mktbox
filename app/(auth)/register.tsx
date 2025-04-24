import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [role, setRole] = useState<'morador' | 'admin'>('morador');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (!nome || !email || !senha || !apartamento) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    setLoading(true);
    try {
      // Cria usuário no Auth
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      // Cria documento no Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        nome,
        email,
        apartamento,
        role
      });
      Alert.alert('Cadastro realizado!', 'Faça login para continuar.');
      router.replace('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Cadastro</Text>
      <TextInput style={styles.inp} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.inp} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.inp} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
      <TextInput style={styles.inp} placeholder="Apartamento" value={apartamento} onChangeText={setApartamento} />
      <Text style={styles.label}>Tipo de usuário:</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'morador' && styles.roleSelected]}
          onPress={() => setRole('morador')}
        >
          <Text style={role === 'morador' ? styles.roleTextSel : styles.roleText}>Morador</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'admin' && styles.roleSelected]}
          onPress={() => setRole('admin')}
        >
          <Text style={role === 'admin' ? styles.roleTextSel : styles.roleText}>Admin</Text>
        </TouchableOpacity>
      </View>
      <Button title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, justifyContent: 'center', padding: 20 },
  ttl: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inp: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  roleRow: { flexDirection: 'row', marginBottom: 20 },
  roleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#007AFF', borderRadius: 5, marginHorizontal: 5, alignItems: 'center' },
  roleSelected: { backgroundColor: '#007AFF' },
  roleText: { color: '#007AFF', fontWeight: 'bold' },
  roleTextSel: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#007AFF', marginTop: 20, textAlign: 'center' }
});