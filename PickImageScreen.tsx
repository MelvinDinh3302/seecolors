import React from 'react';
import { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';

export default function PickImageScreen({ navigation, setImage }: any) {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      navigation.navigate('Preview');
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.granted === false) {
      alert('Camera permission is required to take a photo');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      navigation.navigate('Preview');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>See Colors</Text>
      <Text style={styles.subtitle}>Bringing clarity to color</Text>

      <LottieView
        source={require('./assets/bubble.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose an Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take a photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
});

