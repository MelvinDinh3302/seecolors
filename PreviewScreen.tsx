import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

export default function PreviewScreen({ image, setImage }: any) {
  const [type, setType] = useState('d');

  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Upload and Process" />
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
    height: height * 0.5,
    resizeMode: 'contain',
  },
  picker: {
    height: 50,
    width: width * 0.5,
  },
});
