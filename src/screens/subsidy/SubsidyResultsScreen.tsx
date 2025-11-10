import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const SubsidyResultsScreen = ({ route, navigation }) => {
  const { answers, result } = route.params || {};
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; installer?: string; detail?: string; type?: string; image?: string }>({});

  if (!result) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No results to show</Text>
      </View>
    );
  }

  const { grossCost, central, stateSubsidy, netCost, systemKw } = result;

  const docs = [
    'Identity proof (Aadhaar)',
    'Address proof',
    'Property proof / Sale deed',
    'Latest electricity bill (last 3 months)',
    'Bank details for subsidy transfer',
  ];

  const takePicture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Camera access is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5, base64: true });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } catch (err) {
      console.error('Error taking picture:', err);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const selectFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Gallery access is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5, base64: true });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } catch (err) {
      console.error('Error selecting image:', err);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: takePicture },
      { text: 'Gallery', onPress: selectFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <CustomHeader label="Estimate" subheading="Indicative subsidy & net cost" image_url={null} />

        <CustomJuniorHeader label={'Summary'} action={() => { }} />

        <View style={{ padding: 16, gap: 12 }}>
          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Recommended system size</Text>
            <Text>{systemKw.toFixed(2)} kW</Text>
          </Surface>

          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Cost breakdown</Text>
            <Text>Gross system cost: ₹{Math.round(grossCost).toLocaleString()}</Text>
            <Text>Central subsidy: ₹{Math.round(central).toLocaleString()}</Text>
            <Text>State/DISCOM subsidy: ₹{Math.round(stateSubsidy).toLocaleString()}</Text>
            <Text style={{ marginTop: 6, fontWeight: '700' }}>Estimated net cost: ₹{Math.round(netCost).toLocaleString()}</Text>
          </Surface>

          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Documents typically required</Text>
            {docs.map((d, i) => (
              <Text key={i}>• {d}</Text>
            ))}
          </Surface>

          <Button icon="camera" mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
            {imageUri ? 'Change Image' : 'Add Documents'}
          </Button>
          {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : null}

          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>Back</Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubsidyResultsScreen;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 16 },
  detailInput: { height: 120 },
  imageButton: { marginBottom: 16 },
  previewImage: { width: '100%', height: 200, marginBottom: 16, borderRadius: 8 },
  saveButton: { marginTop: 8 },
  errorText: { color: '#b00020', marginBottom: 8 },
});
