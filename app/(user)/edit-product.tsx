import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const data = snap.data();
        setNome(data.nome);
        setPreco(String(data.preco));
        setDescricao(data.descricao || '');
      }
    }
    fetchProduct();
  }, [id]);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.ctn}>
        <Text style={styles.ttl}>Acesso restrito</Text>
        <Text>Somente administradores podem editar produtos.</Text>
      </View>
    );
  }

  async function handleUpdate() {
    if (!nome || !preco) {
      Alert.alert('Preencha nome e preço!');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'products', id), {
        nome,
        preco: parseFloat(preco.replace(',', '.')),
        descricao
      });
      Alert.alert('Produto atualizado!');
      router.replace('/(user)/products');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Editar Produto</Text>
      <TextInput style={styles.inp} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.inp} placeholder="Preço" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" />
      <TextInput style={styles.inp} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
      <Button title={loading ? 'Salvando...' : 'Salvar'} onPress={handleUpdate} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, justifyContent: 'center', padding: 20 },
  ttl: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inp: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }
});