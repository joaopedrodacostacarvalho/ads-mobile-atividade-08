// app/services/cloudinary.ts
import * as ImageManipulator from 'expo-image-manipulator';

const CLOUD_NAME = "SEU_CLOUD_NAME";
const UPLOAD_PRESET = "SEU_UPLOAD_PRESET";

export const uploadImage = async (uri: string) => {
  try {
    // Opcional: otimizar a imagem antes do upload
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Redimensiona para 800px de largura
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    const base64 = manipulatedImage.base64;
    
    if (!base64) {
      throw new Error('Não foi possível converter a imagem para Base64');
    }

    const file = `data:image/jpeg;base64,${base64}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Erro detalhado do upload:', error);
    throw error;
  }
};