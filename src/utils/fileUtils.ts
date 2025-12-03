import { launchImageLibrary } from 'react-native-image-picker';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Platform } from 'react-native';

/**
 * Opens the gallery for the user to pick an image.
 */
export const pickImage = async (): Promise<string | undefined> => {
    try {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.5,
            selectionLimit: 1,
        });

        if (result.didCancel) {
            return undefined;
        }

        if (result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }
    } catch (e) {
        console.error('Image picking error:', e);
    }
    return undefined;
};

/**
 * Creates a FormData object for multipart/form-data upload.
 */
export const createFormData = (uri: string, fieldName: string, extraData: Record<string, any> = {}): FormData => {
    const formData = new FormData();

    const filename = uri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Android might require removal of 'file://' prefix depending on library version, 
    // but the library usually handles it. If issues arise, clean the URI here.
    const cleanUri = uri; 

    // 1. Append the image file
    formData.append(fieldName, {
        uri: cleanUri,
        name: filename,
        type: type,
    } as any);

    // 2. Append extra text data fields
    Object.keys(extraData).forEach(key => {
        const value = extraData[key];
        // Handle array fields (like expertise) by appending them individually
        if (Array.isArray(value)) {
            value.forEach((item: any) => formData.append(key, item));
        } else {
            formData.append(key, value);
        }
    });

    return formData;
};