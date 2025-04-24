import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export default function AddProduct() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Protege a tela: só admin pode acessar
  if (user?.role !== 'admin') {
    return (
      <View style={styles.ctn}>
        <Text style={styles.ttl}>Acesso restrito</Text>
        <Text>Somente administradores podem cadastrar produtos.</Text>
      </View>
    );
  }

  async function handleAdd() {
    if (!nome || !preco) {
      Alert.alert('Preencha nome e preço!');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        nome,
        preco: parseFloat(preco.replace(',', '.')),
        descricao,
        criadoEm: Timestamp.now()
      });
      Alert.alert('Produto cadastrado!');
      setNome('');
      setPreco('');
      setDescricao('');
      router.replace('/(user)/products');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Cadastrar Produto</Text>
      <TextInput style={styles.inp} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.inp} placeholder="Preço" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
      <TextInput style={styles.inp} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
      <Button title={loading ? 'Salvando...' : 'Salvar'} onPress={handleAdd} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, justifyContent: 'center', padding: 20 },
  ttl: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inp: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }
});