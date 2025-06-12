import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import DropDownPicker from 'react-native-dropdown-picker';
import ImageViewing from 'react-native-image-viewing';

const { width, height } = Dimensions.get('window');

export default function PreviewScreen({ image, setImage }: any) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('d');
  const [items, setItems] = useState([
    { label: 'Deuteranopia', value: 'd' },
    { label: 'Protanopia', value: 'p' },
    { label: 'Tritanopia', value: 't' },
  ]);
  const descriptions: Record<string, { label: string; text: string }> = {
    d: {
      label: 'Deuteranopia',
      text: ' affects the green cones in the eye, making it difficult to distinguish between red and green hues.',
    },
    p: {
      label: 'Protanopia',
      text: ' affects the red cones, leading to confusion between red and green shades.',
    },
    t: {
      label: 'Tritanopia',
      text: ' affects the blue cones, making it hard to distinguish between blue and yellow.',
    },
  };
    

  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [tab, setTab] = useState('original');
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);

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
      formData.append('type', value);
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
      setTab('daltonized');
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
          
          <TouchableOpacity onPress={() => setIsLightboxVisible(true)}>
            <Image
              source={{ uri: tab === 'original' ? image : processedImageUri || image }}
              style={styles.image}
            />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Upload and Process</Text>
        )}
      </TouchableOpacity>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        listMode="SCROLLVIEW"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>
          <Text style={styles.boldText}>{descriptions[value].label}</Text>
          {descriptions[value].text}
        </Text>
      </View>

      <ImageViewing
        images={[{ uri: tab === 'original' ? image : processedImageUri || image }]}
        imageIndex={0}
        visible={isLightboxVisible}
        onRequestClose={() => setIsLightboxVisible(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    backgroundColor: '#f0f4f8',
  },
  image: {
    width: width,
    height: height * 0.4,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  dropdown: {
    borderColor: '#cccccc',
    width: width * 0.80,
    alignSelf: 'center',
  },
  dropdownContainer: {
    width: width * 0.80,
    alignSelf: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#cccccc',
  },
  activeTab: {
    borderColor: '#212529',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 12,
    minWidth: width * 0.55,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionBox: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    width: width * 0.95,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
});