import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export default function Cart() {
  const { cart, clearCart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.preco * item.quantidadeCarrinho, 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid,
        items: cart,
        total,
        criadoEm: Timestamp.now()
      });
      clearCart();
      Alert.alert('Pedido realizado com sucesso!');
      router.replace('/(user)/products');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  }

  return (
    <View style={styles.ctn}>
      <Text style={styles.ttl}>Carrinho</Text>
      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.preco}>R$ {item.preco.toFixed(2)}</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => decreaseQuantity(item.id)}
                >
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtd}>{item.quantidadeCarrinho}</Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => increaseQuantity(item.id)}
                >
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Text style={styles.removeBtnText}>Remover</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.subtotal}>
                Subtotal: R$ {(item.preco * item.quantidadeCarrinho).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Carrinho vazio.</Text>}
      />
      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>
      <Button title="Finalizar pedido" onPress={handleCheckout} disabled={cart.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  ctn: { flex: 1, padding: 20 },
  ttl: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 8, alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  nome: { fontWeight: 'bold', fontSize: 16 },
  preco: { color: '#007AFF', fontWeight: 'bold', marginBottom: 5 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  btn: { backgroundColor: '#007AFF', padding: 6, borderRadius: 5, marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  qtd: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 8 },
  removeBtn: { marginLeft: 10, backgroundColor: '#FF3B30', padding: 6, borderRadius: 5 },
  removeBtnText: { color: '#fff', fontWeight: 'bold' },
  subtotal: { fontStyle: 'italic', color: '#666', marginTop: 2 },
  total: { fontWeight: 'bold', fontSize: 18, marginVertical: 10 }
});