import React, { useState, useEffect } from 'react';
import { View, Image, Button, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';

const { width, height } = Dimensions.get('window');

export default function PreviewScreen({ image, setImage }: any) {
  const [type, setType] = useState('d');
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [tab, setTab] = useState('original');

  useEffect(() => {
    if (image) {
      Image.getSize(image, (width, height) => {
        setImgWidth(width);
        setImgHeight(height);
      }, (error) => {
        console.error("Couldn't get image dimensions:", error);
      });
    }
  }, [image]);

  const handleUpload = async () => {
    if (!image) return;
  
    try {
      setLoading(true);

      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1600;
      
      const actions = [];
      
      if (imgWidth > MAX_WIDTH || imgHeight > MAX_HEIGHT) {
        actions.push({
          resize: {
            width: imgWidth >= imgHeight ? MAX_WIDTH : undefined,
            height: imgHeight > imgWidth ? MAX_HEIGHT : undefined
          }
        });
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        actions,
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
      console.error('Error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {image && (
        <>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity 
              onPress={() => setTab('original')} 
              style={[styles.tabButton, tab === 'original' && styles.activeTab]}
            >
              <Text>Original</Text>
            </TouchableOpacity>
            
            {processedImageUri && (
              <TouchableOpacity 
                onPress={() => setTab('daltonized')} 
                style={[styles.tabButton, tab === 'daltonized' && styles.activeTab]}
              >
                <Text>Daltonized</Text>
              </TouchableOpacity>
            )}
          </View>

          <Image
            source={{ uri: tab === 'original' ? image : processedImageUri || image }}
            style={styles.image}
          />
        </>
      )}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  activeTab: {
    borderColor: '#000',
  },  
});