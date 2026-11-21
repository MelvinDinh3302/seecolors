import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import DropDownPicker from 'react-native-dropdown-picker';
import ImageViewing from 'react-native-image-viewing';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';
import ColorPalette, { PaletteColor } from './ColorPalette';

type ImagePalettes = {
  original: PaletteColor[];
  daltonized: PaletteColor[];
};
const { width, height } = Dimensions.get('window');
const DEFAULT_SEVERITY = 1;

export default function PreviewScreen({ image, setImage }: any) {
  const [severity, setSeverity] = useState(DEFAULT_SEVERITY);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('d');
  const [items, setItems] = useState([
    { label: 'Deuteranopia', value: 'd' },
    { label: 'Protanopia', value: 'p' },
    { label: 'Tritanopia', value: 't' },
  ]);
  const [palettes, setPalettes] = useState<ImagePalettes | null>(null);    
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);
  const [tab, setTab] = useState('original');
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (image) {
      Image.getSize(image, (width, height) => {
        setImgWidth(width);
        setImgHeight(height);
      }, (error) => {
        console.error("Image dimensions error:", error);
        Alert.alert('Error', 'Unable to load image dimensions.');
      });
    }
  }, [image]);

  useEffect(() => {
    setPalettes(null);
    setProcessedImageUri(null);
    setTab('original');
  }, [image, value, severity]);

  const handleUpload = async () => {
    if (!image) return;
  
    try {
      setLoading(true);
      setPalettes(null);
      setProcessedImageUri(null);
      setTab('original');

    const MAX_WIDTH = 1200;
    const MAX_HEIGHT = 1600;

    const scale = Math.min(
      1,
      MAX_WIDTH / imgWidth,
      MAX_HEIGHT / imgHeight
    );

    const actions = scale < 1
      ? [{
          resize: {
            width: Math.round(imgWidth * scale),
          },
        }]
      : [];

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
      formData.append('severity', severity.toFixed(1));
      formData.append('image', {
        uri: manipulatedImage.uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any);
  
      const response = await fetch(
        'https://daltonize-api.up.railway.app/daltonize',
        {
          method: 'POST',
          body: formData,
        }
      );  

      if (!response.ok) {
        throw new Error(
          `Upload failed with status ${response.status}`
        );
      }

      // Read the palette from the response header.
      const paletteHeader =
        response.headers.get('X-Color-Palettes');

      let newPalettes: ImagePalettes | null = null;

      if (paletteHeader) {
        try {
          const parsed = JSON.parse(paletteHeader);

          if (
            Array.isArray(parsed.original) &&
            Array.isArray(parsed.daltonized)
          ) {
            newPalettes = parsed as ImagePalettes;
          }
        } catch (error) {
          console.warn('Invalid palette data:', error);
        }
      }

      // The response body is still the corrected JPEG.
      const blob = await response.blob();      
      const reader = new Response(blob);
      const buffer = await reader.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
  
      const fileUri = FileSystem.documentDirectory + 'result.jpg';
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      setProcessedImageUri(fileUri + `?t=${Date.now()}`);
      setPalettes(newPalettes);
      setTab('daltonized');
    } catch (err: any) {
      console.error('Image processing error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync(true);
      if (status !== 'granted') {
        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync(true);
        if (newStatus !== 'granted') {
          Alert.alert('Permission denied', 'Media library permission is required to save images.');
          return;
        }
      }
  
      const uriToSave = tab === 'original' ? image : processedImageUri;
      if (!uriToSave) return;
  
      await MediaLibrary.saveToLibraryAsync(uriToSave.split('?')[0]);

      fadeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.delay(900),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    } catch (err) {
      console.error('Save image error:', err);

      Alert.alert(
        'Save failed',
        'Unable to save the image. Please try again.'
      );
    }
  };
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f0f4f8' }}
      contentContainerStyle={{
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 32,
      }}
    >

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

      <View style={{ width: '80%' }}>
        <Text>Correction strength ({severity.toFixed(1)})</Text>
        <Slider
          accessibilityLabel="Correction strength"
          minimumValue={0}
          maximumValue={1}
          step={0.1}
          value={severity}
          onValueChange={setSeverity}
          disabled={loading}
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleUpload}
        disabled={loading || imgWidth === 0 || imgHeight === 0}
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
        disabled={loading}
      />

      <ColorPalette
        colors={
          tab === 'original'
            ? palettes?.original ?? []
            : palettes?.daltonized ?? []
        }
        loading={loading}
      />

      <ImageViewing
        images={[{ uri: tab === 'original' ? image : processedImageUri || image }]}
        imageIndex={0}
        visible={isLightboxVisible}
        onRequestClose={() => setIsLightboxVisible(false)}
        FooterComponent={() => (
          <>
            <View style={styles.lightboxFooter}>
              <TouchableOpacity onPress={handleSave} style={styles.footerButton}>
                <Text style={styles.footerButtonText}>Save Image</Text>
              </TouchableOpacity>
            </View>

            <Animated.View style={[styles.overlayInLightbox, { opacity: fadeAnim }]}>
              <Animated.Image source={require('./assets/saved.png')} style={styles.savedImage} />
            </Animated.View>
          </>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  lightboxFooter: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  footerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlayInLightbox: {
    position: 'absolute',
    bottom: height * 0.4,
    width: '100%',
    alignItems: 'center',
  },
    savedImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 30,
    opacity: 0.6,
  },
});