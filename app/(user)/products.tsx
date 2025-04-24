import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Button, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image 
} from 'react-native';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useRouter } from 'expo-router';

type Product = {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
  quantidade: number;
  imageUrl: string;
};

export default function Products() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const router = useRouter();

  async function fetchProdutos() {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q);
      const list: Product[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          nome: data.nome,
          preco: data.preco,
          descricao: data.descricao,
          quantidade: data.quantidade,
          imageUrl: data.imageUrl
        });
      });
      setProdutos(list);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProdutos();
  }, []);

  function handleEdit(id: string) {
    router.push({ pathname: '/(user)/edit-product', params: { id } });
  }

  async function handleDelete(id: string) {
    Alert.alert(
      'Confirmação',
      'Deseja remover este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', id));
              Alert.alert('Sucesso', 'Produto removido!');
              fetchProdutos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o produto.');
              console.error(error);
            }
          }
        }
      ]
    );
  }

  function handleAddToCart(product: Product) {
    if (product.quantidade <= 0) {
      Alert.alert('Erro', 'Produto sem estoque!');
      return;
    }
    addToCart(product);
    Alert.alert('Sucesso', 'Produto adicionado ao carrinho!');
  }

  // Função para obter a quantidade no carrinho de um produto
  function getCartQuantity(productId: string) {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantidade : 0;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Produtos do Mercadinho</Text>
        {user?.role === 'admin' && (
          <Button 
            title="Cadastrar Produto" 
            onPress={() => router.push('/(user)/add-product')} 
          />
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUrl && (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productName}>{item.nome}</Text>
                  <Text style={styles.productPrice}>
                    R$ {item.preco.toFixed(2)}
                  </Text>
                </View>

                {item.descricao && (
                  <Text style={styles.description}>{item.descricao}</Text>
                )}

                <Text style={styles.stock}>
                  Em estoque: {item.quantidade}
                </Text>

                {user?.role === 'admin' ? (
                  <View style={styles.adminButtons}>
                    <TouchableOpacity 
                      onPress={() => handleEdit(item.id)} 
                      style={styles.editButton}
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(item.id)} 
                      style={styles.deleteButton}
                    >
                      <Text style={styles.buttonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      style={[
                        styles.cartButton,
                        item.quantidade <= 0 && styles.disabledButton
                      ]}
                      onPress={() => handleAddToCart(item)}
                      disabled={item.quantidade <= 0}
                    >
                      <Text style={styles.buttonText}>
                        Adicionar ao carrinho
                      </Text>
                    </TouchableOpacity>
                    {getCartQuantity(item.id) > 0 && (
                      <Text style={styles.cartQuantity}>
                        No carrinho: {getCartQuantity(item.id)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum produto cadastrado.
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 20
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  description: {
    color: '#666',
    marginBottom: 8
  },
  stock: {
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center'
  },
  cartButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  cartQuantity: {
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20
  }
});