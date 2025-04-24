import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    setLoading(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user?.uid),
      orderBy('criadoEm', 'desc')
    );
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
    setOrders(list);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Meus Pedidos</Text>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.data}>
                {item.criadoEm?.toDate().toLocaleString()}
              </Text>
              {item.items.map((prod: any, idx: number) => (
                <Text key={idx}>
                  {prod.nome} x{prod.quantidade} - R$ {(prod.preco * prod.quantidade).toFixed(2)}
                </Text>
              ))}
              <Text style={styles.total}>Total: R$ {item.total.toFixed(2)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>Nenhum pedido encontrado.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, padding: 20 },
  ttl: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 8 },
  data: { color: '#888', fontSize: 12 },
  total: { fontWeight: 'bold', marginTop: 5 }
});