export const IMGBB_API_KEY = '8a1a93fea40adee0e5ddc564fe47de50';

export async function uploadImage(base64Image: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    }
    throw new Error('Falha no upload da imagem');
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}