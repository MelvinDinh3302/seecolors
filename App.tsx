import { useState } from 'react';
import { Button, Image, View, StyleSheet, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

export default function ImagePickerExample() {
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState('d');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image" onPress={pickImage} />
      <View style={{ marginVertical: 10 }}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
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
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
    resizeMode: 'contain', 
  },
  picker: {
    height: 50, 
    width: width * 0.5,
  }
});
