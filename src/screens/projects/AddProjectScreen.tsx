import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import { Text, Menu, TextInput as PaperTextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { addProject } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';

const OPTIONS = [
  { label: 'On-grid (Net-metering)', value: 'on-grid' },
  { label: 'Off-grid (Battery)', value: 'off-grid' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Community / Shared', value: 'shared' },
  { label: 'Other', value: 'other' },
];

type Props = { navigation: any };

const AddProjectScreen: React.FC<Props> = ({ navigation }) => {
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
        name: name.trim(),
        detail: detail.trim(),
        systemType: type,
        type,
        installer: installer.trim(),
        imageBase64,
        sitePhotoBase64: imageBase64,
        installationDate: installationDate.toISOString(),
        createdAt: new Date(),
      };
      await addProject(payload);
      Alert.alert('Success', 'Project saved!', [{ text: 'OK', onPress: () => navigation.navigate('ProjectsScreen') }]);
    } catch (err) {
      console.error('Error saving project:', err);
      Alert.alert('Error', 'Something went wrong while saving the project.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeLabel = OPTIONS.find(o => o.value === type)?.label ?? '';

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label="Add solar project"
        subheading="Keep a living record of installs, vendors and project artefacts."
      />

      <View style={[layout.formCard, styles.card]}>
        <AppTextInput
          label="Project / site name"
          value={name}
          onChangeText={setName}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <AppTextInput
          label="Installer / vendor"
          value={installer}
          onChangeText={setInstaller}
        />
        {errors.installer ? <Text style={styles.errorText}>{errors.installer}</Text> : null}

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            System type
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <AppButton mode="outlined" onPress={() => setMenuVisible(true)} style={styles.selector}>
                {selectedTypeLabel || 'Select system type'}
              </AppButton>
            }
            contentStyle={styles.menuContent}
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
          <AppTextInput
            label="Installation date"
            value={installationDate.toLocaleDateString()}
            editable={false}
            right={<PaperTextInput.Icon icon="calendar" />}
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
              setShowDatePicker(Platform.OS === 'ios');
              setInstallationDate(sel);
            }}
          />
        )}

        <AppTextInput
          label="Project details / notes"
          value={detail}
          onChangeText={setDetail}
          multiline
        />
        {errors.detail ? <Text style={styles.errorText}>{errors.detail}</Text> : null}

        <AppButton icon="camera" mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
          {imageUri ? 'Change image' : 'Add site photo'}
        </AppButton>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : null}

        <AppButton
          mode="contained"
          loading={loading}
          onPress={handleSave}
          disabled={loading}
          icon="content-save"
        >
          Save project
        </AppButton>

        <AppButton
          mode="contained"
          loading={loading}
          onPress={() => navigation.navigate('ProjectsScreen')}
          disabled={loading}
          icon="arrow-left"
        >
          Go Back
        </AppButton>
      </View>
    </ScrollView>
  );
};

export default AddProjectScreen;

const styles = StyleSheet.create({
  card: {
    gap: 18,
  },
  selector: {
    justifyContent: 'flex-start',
  },
  menuContent: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
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
  fieldLabel: {
    marginBottom: 6,
  },
});
