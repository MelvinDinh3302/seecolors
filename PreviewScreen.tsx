import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

export default function PreviewScreen({ image, setImage }: any) {
  const [type, setType] = useState('d');
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;
  
    try {
      setLoading(true);
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 1200 } }],
        { 
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      const formData = new FormData();
      formData.append('type', type);
      formData.append('image', {
        uri: manipulatedImage.uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);
  
      const response = await fetch('https://daltonize-api.up.railway.app/daltonize', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }
  
      const blob = await response.blob();
      const reader = new Response(blob);
      const buffer = await reader.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
  
      const fileUri = FileSystem.documentDirectory + 'result.jpg';
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      setProcessedImageUri(fileUri + `?t=${Date.now()}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Upload and Process" onPress={handleUpload} />
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Deuteranopia" value="d" />
        <Picker.Item label="Protanopia" value="p" />
        <Picker.Item label="Tritanopia" value="t" />
      </Picker>
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {processedImageUri && (
        <Image source={{ uri: processedImageUri }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    backgroundColor: 'white',
  },
  image: {
    width: width,
    height: height * 0.4,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: width * 0.6,
  },
});
