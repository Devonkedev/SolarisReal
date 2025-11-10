import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, View, Linking } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';

const SubsidyResultsScreen = ({ route, navigation }) => {
  const { answers, result, matches = [] } = route.params || {};
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

  const handleOpenUrl = (url?: string) => {
    if (!url) {
      Alert.alert('No application link', 'Application details are available through your DISCOM/official portal.');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link', 'Please copy the URL and open it in your browser.');
    });
  };

  const showImageOptions = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: takePicture },
      { text: 'Gallery', onPress: selectFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label="Estimate & recommendations"
        subheading="Here’s a snapshot of your system sizing, subsidies and next steps."
        image_url="https://i.postimg.cc/CLkyNwZT/Screenshot-2025-11-10-at-5-03-23-PM.png"
      />

      <View style={[layout.formCard, styles.cardStack]}>
        <CustomJuniorHeader label="Summary" />

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">Recommended system size</Text>
          <Text variant="headlineMedium" style={styles.highlight}>
            {systemKw.toFixed(2)} kW
          </Text>
        </Surface>

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">Cost breakdown</Text>
          <Text>Gross system cost: ₹{Math.round(grossCost).toLocaleString()}</Text>
          <Text>Central subsidy: ₹{Math.round(central).toLocaleString()}</Text>
          <Text>State/DISCOM subsidy: ₹{Math.round(stateSubsidy).toLocaleString()}</Text>
          <Text style={styles.total}>Estimated net cost: ₹{Math.round(netCost).toLocaleString()}</Text>
        </Surface>

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">Documents typically required</Text>
          {docs.map((d, i) => (
            <Text key={i}>• {d}</Text>
          ))}
        </Surface>

        <Surface style={[styles.surface, styles.matchSurface]} elevation={1}>
          <Text variant="titleMedium">Recommended subsidy programmes</Text>
          {matches.length === 0 ? (
            <Text>No direct programme match found. Explore central rooftop schemes via the national portal.</Text>
          ) : (
            matches.map(({ scheme, matchScore, reasons }) => (
              <View key={scheme.id} style={styles.schemeCard}>
                <Text style={styles.schemeTitle}>{scheme.name}</Text>
                <Text style={styles.schemeSubtitle}>{scheme.administrator}</Text>
                <Text>Match score: {matchScore.toFixed(1)}</Text>
                <Text>Subsidy type: {scheme.subsidyType}</Text>
                <Text>Benefit: {scheme.benefit}</Text>
                <Text style={styles.schemeReasonsLabel}>Why it fits:</Text>
                {reasons.map((reason, idx) => (
                  <Text key={idx} style={styles.schemeReason}>
                    • {reason}
                  </Text>
                ))}
                <Text>Application: {scheme.applicationProcess}</Text>
                {scheme.applicationUrl ? (
                  <AppButton mode="outlined" onPress={() => handleOpenUrl(scheme.applicationUrl)} compact>
                    Open portal
                  </AppButton>
                ) : (
                  <AppButton mode="outlined" onPress={() => handleOpenUrl()} compact>
                    See details
                  </AppButton>
                )}
                <Text style={styles.schemeMeta}>Timeline: {scheme.timeline}</Text>
                <Text style={styles.schemeMeta}>Vendors: {scheme.vendorInfo}</Text>
                <Text style={styles.schemeMeta}>Notes: {scheme.notes}</Text>
              </View>
            ))
          )}
        </Surface>

        <AppButton mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
          {imageUri ? 'Change image' : 'Add documents'}
        </AppButton>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : null}

        <AppButton mode="contained" onPress={() => navigation.goBack()}>
          Back
        </AppButton>
      </View>
    </ScrollView>
  );
};

export default SubsidyResultsScreen;

const styles = StyleSheet.create({
  cardStack: {
    gap: 20,
  },
  surface: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  matchSurface: {
    gap: 16,
  },
  highlight: {
    color: '#1E3A8A',
  },
  total: {
    marginTop: 6,
    fontWeight: '700',
  },
  imageButton: {
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  errorText: {
    color: '#b00020',
  },
  schemeCard: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    gap: 6,
  },
  schemeTitle: {
    fontSize: 17,
    fontFamily: 'OpenSauce-Bold',
  },
  schemeSubtitle: {
    fontStyle: 'italic',
    color: '#475569',
  },
  schemeReasonsLabel: {
    marginTop: 6,
    fontFamily: 'OpenSauce-Bold',
  },
  schemeReason: {
    marginLeft: 4,
  },
  schemeMeta: {
    color: '#4B5563',
    fontSize: 13,
  },
});
