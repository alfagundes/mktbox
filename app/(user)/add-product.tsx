import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../services/imgbb';

export default function AddProduct() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Protege a tela: só admin pode acessar
  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acesso restrito</Text>
        <Text>Somente administradores podem cadastrar produtos.</Text>
      </View>
    );
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploadingImage(true);
        const uploadedUrl = await uploadImage(result.assets[0].base64);
        setImageUrl(uploadedUrl);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
      setUploadingImage(false);
    }
  }

  async function handleAdd() {
    if (!nome || !preco || !quantidade) {
      Alert.alert('Preencha os campos obrigatórios!');
      return;
    }

    if (!imageUrl) {
      Alert.alert('Adicione uma imagem para o produto!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        nome,
        preco: parseFloat(preco.replace(',', '.')),
        descricao,
        quantidade: parseInt(quantidade),
        imageUrl,
        criadoEm: Timestamp.now()
      });
      Alert.alert('Sucesso', 'Produto cadastrado!');
      router.replace('/(user)/products');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Produto</Text>

      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={pickImage}
        disabled={uploadingImage}
      >
        {uploadingImage ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Toque para adicionar imagem</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome do produto *"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço *"
        value={preco}
        onChangeText={setPreco}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade em estoque *"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="number-pad"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />

      <Button
        title={loading ? 'Salvando...' : 'Salvar Produto'}
        onPress={handleAdd}
        disabled={loading || uploadingImage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imagePlaceholder: {
    color: '#666'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  }
});