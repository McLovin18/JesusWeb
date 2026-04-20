import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImageAndGetUrl = async (file: File, path: string = 'images'): Promise<string> => {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `${path}/${filename}`);
    
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
