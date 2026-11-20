
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

export type PaletteColor = {
  hex: string;
  name: string;
  percentage: number;
};

type Props = {
  colors: PaletteColor[];
  loading: boolean;
};

export default function ColorPalette({
  colors,
  loading,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Dominant Colours
      </Text>

      {loading ? (
        <Text style={styles.message}>
          Analysing colours...
        </Text>
      ) : colors.length === 0 ? (
        <Text style={styles.message}>
          Process the image to see its dominant colours.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {colors.map((color, index) => (
            <View
              key={`${color.hex}-${index}`}
              style={styles.item}
              accessible
              accessibilityLabel={
                `${color.name}, ${color.percentage.toFixed(1)} percent`
              }
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: color.hex },
                ]}
              />

              <Text
                style={styles.name}
                numberOfLines={2}
              >
                {color.name}
              </Text>

              <Text style={styles.percentage}>
                {color.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    marginTop: 12,
    width: '95%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#6c757d',
  },
  row: {
    paddingRight: 2,
  },
  item: {
    width: 90,
    marginRight: 10,
    alignItems: 'center',
  },
  swatch: {
    width: 80,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginTop: 6,
    minHeight: 30,
  },
  percentage: {
    fontSize: 12,
    color: '#6c757d',
  },
});
