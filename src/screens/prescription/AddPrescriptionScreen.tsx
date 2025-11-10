import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import { Appbar, Button, TextInput, Text, Menu, List } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { addPrescription } from '../../config/firebase';

const OPTIONS = [
  { label: 'On-grid (Net-metering)', value: 'on-grid' },
  { label: 'Off-grid (Battery)', value: 'off-grid' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Community / Shared', value: 'shared' },
  { label: 'Other', value: 'other' },
];

type Props = { navigation: any };

const AddPrescriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [installer, setInstaller] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [installationDate, setInstallationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; installer?: string; detail?: string; type?: string; image?: string }>({});

  // local dropdown state (using react-native-paper Menu)
  const [menuVisible, setMenuVisible] = useState(false);

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

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Please enter the project/site name.';
    if (!installer.trim()) newErrors.installer = 'Please enter the installer/vendor name.';
    if (!detail.trim()) newErrors.detail = 'Please enter project details.';
    if (!type) newErrors.type = 'Please select system type.';
    if (!imageBase64) newErrors.image = 'Please add a site photo.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Missing Info', 'Please fill required fields highlighted in the form.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        // legacy fields
        name: name.trim(),
        doctor: installer.trim(),
        detail: detail.trim(),
        type,
        imageBase64,
        // solar-friendly aliases
        installer: installer.trim(),
        description: detail.trim(),
        systemType: type,
        sitePhotoBase64: imageBase64,
        installationDate: installationDate.toISOString(),
        createdAt: new Date(),
      };
      await addPrescription(payload);
      Alert.alert('Success', 'Project saved!', [{ text: 'OK', onPress: () => navigation.navigate('PrescriptionScreen') }]);
    } catch (err) {
      console.error('Error saving project:', err);
      Alert.alert('Error', 'Something went wrong while saving the project.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeLabel = OPTIONS.find(o => o.value === type)?.label ?? '';

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Solar Project" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="Project / Site Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <TextInput
          label="Installer / Vendor"
          value={installer}
          onChangeText={setInstaller}
          mode="outlined"
          style={styles.input}
          error={!!errors.installer}
        />
        {errors.installer ? <Text style={styles.errorText}>{errors.installer}</Text> : null}

        {/* System Type (Dropdown using Menu) */}
        <View style={{ marginBottom: 16 }}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity activeOpacity={0.8} onPress={() => setMenuVisible(true)}>
                <TextInput
                  label="System Type"
                  mode="outlined"
                  value={selectedTypeLabel}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" />}
                  error={!!errors.type}
                />
              </TouchableOpacity>
            }
          >
            {OPTIONS.map(opt => (
              <Menu.Item
                key={opt.value}
                title={opt.label}
                onPress={() => {
                  setType(opt.value);
                  setMenuVisible(false);
                  setErrors(prev => ({ ...prev, type: '' }));
                }}
              />
            ))}
          </Menu>
          {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}
        </View>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <TextInput
            label="Installation Date"
            value={installationDate.toLocaleDateString()}
            mode="outlined"
            style={styles.input}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={installationDate}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              const sel = d || installationDate;
              setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS spinner
              setInstallationDate(sel);
            }}
          />
        )}

        <TextInput
          label="Project Details / Notes"
          value={detail}
          onChangeText={setDetail}
          mode="outlined"
          multiline
          numberOfLines={5}
          style={[styles.input, styles.detailInput]}
          error={!!errors.detail}
        />
        {errors.detail ? <Text style={styles.errorText}>{errors.detail}</Text> : null}

        <Button icon="camera" mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
          {imageUri ? 'Change Image' : 'Add Site Photo'}
        </Button>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : null}

        <Button
          mode="contained"
          loading={loading}
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
          icon="content-save"
        >
          Save Project
        </Button>
      </ScrollView>
    </>
  );
};

export default AddPrescriptionScreen;

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 16 },
  detailInput: { height: 120 },
  imageButton: { marginBottom: 16 },
  previewImage: { width: '100%', height: 200, marginBottom: 16, borderRadius: 8 },
  saveButton: { marginTop: 8 },
  errorText: { color: '#b00020', marginBottom: 8 },
});
