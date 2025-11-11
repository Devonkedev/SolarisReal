import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import { Text, Menu, TextInput as PaperTextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { addProject } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';

type Props = { navigation: any };

const AddProjectScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
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

  const options = useMemo(
    () => [
      { label: t('systemOptionOnGrid'), value: 'on-grid' },
      { label: t('systemOptionOffGrid'), value: 'off-grid' },
      { label: t('systemOptionHybrid'), value: 'hybrid' },
      { label: t('systemOptionShared'), value: 'shared' },
      { label: t('systemOptionOther'), value: 'other' },
    ],
    [t]
  );

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
        setErrors(prev => ({ ...prev, image: undefined }));
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
        setErrors(prev => ({ ...prev, image: undefined }));
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
    if (!name.trim()) newErrors.name = t('addProjectValidationName');
    if (!installer.trim()) newErrors.installer = t('addProjectValidationInstaller');
    if (!detail.trim()) newErrors.detail = t('addProjectValidationDetail');
    if (!type) newErrors.type = t('addProjectValidationType');
    if (!imageBase64) newErrors.image = t('addProjectValidationImage');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert(t('addProjectMissingInfoTitle'), t('addProjectMissingInfoBody'));
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
      Alert.alert(t('addProjectSaveSuccessTitle'), t('addProjectSaveSuccessBody'), [
        { text: t('addProjectSaveSuccessOk'), onPress: () => navigation.navigate('ProjectsScreen') },
      ]);
    } catch (err) {
      console.error('Error saving project:', err);
      Alert.alert(t('addProjectSaveErrorTitle'), t('addProjectSaveErrorBody'));
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeLabel = options.find(o => o.value === type)?.label ?? '';

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label={t('addProjectHeaderTitle')}
        subheading={t('addProjectHeaderSubtitle')}
      />

      <View style={[layout.formCard, styles.card]}>
        <AppTextInput
          label={t('addProjectNameLabel')}
          value={name}
          onChangeText={setName}
        />
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <AppTextInput
          label={t('addProjectInstallerLabel')}
          value={installer}
          onChangeText={setInstaller}
        />
        {errors.installer ? <Text style={styles.errorText}>{errors.installer}</Text> : null}

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            {t('addProjectSystemLabel')}
          </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <AppButton mode="outlined" onPress={() => setMenuVisible(true)} style={styles.selector}>
                {selectedTypeLabel || t('addProjectSystemPlaceholder')}
              </AppButton>
            }
            contentStyle={styles.menuContent}
          >
            {options.map(opt => (
              <Menu.Item
                key={opt.value}
                title={opt.label}
                onPress={() => {
                  setType(opt.value);
                  setMenuVisible(false);
                  setErrors(prev => ({ ...prev, type: undefined }));
                }}
              />
            ))}
          </Menu>
          {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}
        </View>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <AppTextInput
            label={t('addProjectDateLabel')}
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
          label={t('addProjectDetailLabel')}
          value={detail}
          onChangeText={setDetail}
          multiline
        />
        {errors.detail ? <Text style={styles.errorText}>{errors.detail}</Text> : null}

        <AppButton icon="camera" mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
          {imageUri ? t('addProjectImageChange') : t('addProjectImageAdd')}
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
          {t('addProjectSaveCta')}
        </AppButton>

        <AppButton
          mode="contained"
          loading={loading}
          onPress={() => navigation.navigate('ProjectsScreen')}
          disabled={loading}
          icon="arrow-left"
        >
          {t('addProjectBackCta')}
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
