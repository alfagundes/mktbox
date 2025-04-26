import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

type Pedido = {
  id: string;
  userId: string;
  criadoEm: any;
  total: number;
  items: {
    id: string;
    nome: string;
    preco: number;
    quantidadeCarrinho: number;
    imageUrl?: string;
  }[];
};

export default function Admin() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllOrders();
    }
  }, [user]);

  async function fetchAllOrders() {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      const list: Pedido[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Pedido));
      setOrders(list);
    } catch (error) {
      setOrders([]);
    }
    setLoading(false);
  }

  if (user?.role !== 'admin') {
    return (
      <View style={styles.ctn}>
        <Text style={styles.ttl}>Acesso restrito</Text>
        <Text>Somente administradores podem acessar esta tela.</Text>
      </View>
    );
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Pedidos Recebidos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.data}>
                {item.criadoEm?.toDate
                  ? item.criadoEm.toDate().toLocaleString()
                  : ''}
              </Text>
              <Text style={styles.userId}>Morador: {item.userId}</Text>
              {item.items.map((prod, idx) => (
                <View key={idx} style={styles.prodRow}>
                  {prod.imageUrl && (
                    <Image
                      source={{ uri: prod.imageUrl }}
                      style={styles.prodImage}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prodName}>{prod.nome}</Text>
                    <Text style={styles.prodQtd}>
                      Quantidade: {prod.quantidadeCarrinho}
                    </Text>
                    <Text style={styles.prodPrice}>
                      R$ {(prod.preco * prod.quantidadeCarrinho).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
              <Text style={styles.total}>
                Total: R$ {item.total.toFixed(2)}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 30 }}>
              Nenhum pedido encontrado.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, padding: 20, backgroundColor: '#fff' },
  ttl: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  data: { color: '#888', fontSize: 12, marginBottom: 8 },
  userId: { color: '#333', fontSize: 13, marginBottom: 4 },
  prodRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  prodImage: { width: 40, height: 40, borderRadius: 6, marginRight: 10 },
  prodName: { fontWeight: 'bold', fontSize: 15 },
  prodQtd: { color: '#666', fontSize: 13 },
  prodPrice: { color: '#007AFF', fontWeight: 'bold', fontSize: 14 },
  total: { fontWeight: 'bold', marginTop: 8, fontSize: 16, color: '#222' },
});