import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, View, Linking } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import * as ImagePicker from 'expo-image-picker';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { getSchemeFilterOptions, SchemeCoverage } from '../../utils/schemeMatcher';
import { useTranslation } from '../../hooks/useTranslation';

const SubsidyResultsScreen = ({ route, navigation }) => {
  const { answers, result, matches = [] } = route.params || {};
  const { translate } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; installer?: string; detail?: string; type?: string; image?: string }>({});
  const [coverageFilter, setCoverageFilter] = useState<'all' | SchemeCoverage>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owner' | 'tenant'>('all');
  const [gridFilter, setGridFilter] = useState<'all' | 'grid' | 'off-grid'>('all');

  if (!result) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{translate('No results to show')}</Text>
      </View>
    );
  }

  const { grossCost, central, stateSubsidy, netCost, systemKw } = result;

  const docs = useMemo(
    () => [
      translate('Identity proof (Aadhaar)'),
      translate('Address proof'),
      translate('Property proof / Sale deed'),
      translate('Latest electricity bill (last 3 months)'),
      translate('Bank details for subsidy transfer'),
    ],
    [translate]
  );

  const takePicture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(translate('Permission denied'), translate('Camera access is required.'));
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
      Alert.alert(translate('Error'), translate('Failed to take picture'));
    }
  };

  const selectFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(translate('Permission denied'), translate('Gallery access is required.'));
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
      Alert.alert(translate('Error'), translate('Failed to select image'));
    }
  };

  const handleOpenUrl = (url?: string) => {
    if (!url) {
      Alert.alert(
        translate('No application link'),
        translate('Application details are available through your DISCOM/official portal.')
      );
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert(
        translate('Unable to open link'),
        translate('Please copy the URL and open it in your browser.')
      );
    });
  };

  const filterMeta = useMemo(() => getSchemeFilterOptions(matches.map(m => m.scheme)), [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(({ scheme }) => {
      if (coverageFilter !== 'all' && scheme.coverage !== coverageFilter) {
        return false;
      }

      if (ownershipFilter === 'owner' && !scheme.requiresOwnership) {
        return false;
      }
      if (ownershipFilter === 'tenant' && scheme.requiresOwnership) {
        return false;
      }

      if (gridFilter === 'grid' && scheme.requiresGridConnection === false) {
        return false;
      }
      if (gridFilter === 'off-grid' && scheme.requiresGridConnection !== false) {
        return false;
      }

      return true;
    });
  }, [matches, coverageFilter, ownershipFilter, gridFilter]);

  const showImageOptions = () => {
    Alert.alert(translate('Select image'), translate('Choose an option'), [
      { text: translate('Camera'), onPress: takePicture },
      { text: translate('Gallery'), onPress: selectFromGallery },
      { text: translate('Cancel'), style: 'cancel' },
    ]);
  };


  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label={translate('Estimate & recommendations')}
        subheading={translate('Here’s a snapshot of your system sizing, subsidies and next steps.')}
        image_url="https://i.postimg.cc/CLkyNwZT/Screenshot-2025-11-10-at-5-03-23-PM.png"
      />

      <View style={[layout.formCard, styles.cardStack]}>
        <CustomJuniorHeader label={translate('Summary')} />

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">{translate('Recommended system size')}</Text>
          <Text variant="headlineMedium" style={styles.highlight}>
            {systemKw.toFixed(2)} kW
          </Text>
        </Surface>

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">{translate('Cost breakdown')}</Text>
          <Text>
            {translate('Gross system cost')}: ₹{Math.round(grossCost).toLocaleString()}
          </Text>
          <Text>
            {translate('Central subsidy')}: ₹{Math.round(central).toLocaleString()}
          </Text>
          <Text>
            {translate('State/DISCOM subsidy')}: ₹{Math.round(stateSubsidy).toLocaleString()}
          </Text>
          <Text style={styles.total}>
            {translate('Estimated net cost')}: ₹{Math.round(netCost).toLocaleString()}
          </Text>
        </Surface>

        <Surface style={styles.surface} elevation={1}>
          <Text variant="titleMedium">{translate('Documents typically required')}</Text>
          {docs.map((d, i) => (
            <Text key={i}>• {d}</Text>
          ))}
        </Surface>

        <Surface style={[styles.surface, styles.matchSurface]} elevation={1}>
          <Text variant="titleMedium">{translate('Recommended subsidy programmes')}</Text>
          <View style={styles.filterContainer}>
            <View style={styles.filterGroup}>
              <Text variant="labelMedium" style={styles.filterLabel}>
                {translate('Coverage')}
              </Text>
              <View style={styles.chipRow}>
                <Chip
                  selected={coverageFilter === 'all'}
                  onPress={() => setCoverageFilter('all')}
                  style={styles.chip}
                >
                  {translate('All')}
                </Chip>
                {filterMeta.coverage.map(option => (
                  <Chip
                    key={option}
                    selected={coverageFilter === option}
                    onPress={() => setCoverageFilter(option)}
                    style={styles.chip}
                  >
                    {option === 'csr'
                      ? translate('CSR / NGO')
                      : translate(option.charAt(0).toUpperCase() + option.slice(1))}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text variant="labelMedium" style={styles.filterLabel}>
                {translate('Ownership')}
              </Text>
              <View style={styles.chipRow}>
                <Chip selected={ownershipFilter === 'all'} onPress={() => setOwnershipFilter('all')} style={styles.chip}>
                  {translate('All')}
                </Chip>
                <Chip selected={ownershipFilter === 'owner'} onPress={() => setOwnershipFilter('owner')} style={styles.chip}>
                  {translate('Owner required')}
                </Chip>
                <Chip selected={ownershipFilter === 'tenant'} onPress={() => setOwnershipFilter('tenant')} style={styles.chip}>
                  {translate('Tenant-friendly')}
                </Chip>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text variant="labelMedium" style={styles.filterLabel}>
                {translate('Grid connection')}
              </Text>
              <View style={styles.chipRow}>
                <Chip selected={gridFilter === 'all'} onPress={() => setGridFilter('all')} style={styles.chip}>
                  {translate('All')}
                </Chip>
                <Chip selected={gridFilter === 'grid'} onPress={() => setGridFilter('grid')} style={styles.chip}>
                  {translate('Grid')}
                </Chip>
                <Chip selected={gridFilter === 'off-grid'} onPress={() => setGridFilter('off-grid')} style={styles.chip}>
                  {translate('Off-grid')}
                </Chip>
              </View>
            </View>
          </View>

          {matches.length === 0 ? (
            <Text>
              {translate(
                'No direct programme match found. Explore central rooftop schemes via the national portal.'
              )}
            </Text>
          ) : filteredMatches.length === 0 ? (
            <Text>
              {translate('No programmes match the selected filters. Try loosening them to see more options.')}
            </Text>
          ) : (
            filteredMatches.map(({ scheme, matchScore, reasons }) => (
              <View key={scheme.id} style={styles.schemeCard}>
                <Text style={styles.schemeTitle}>{scheme.name}</Text>
                <Text style={styles.schemeSubtitle}>{scheme.administrator}</Text>
                <Text>{translate('Match score')}: {matchScore.toFixed(1)}</Text>
                <Text>{translate('Subsidy type')}: {scheme.subsidyType}</Text>
                <Text>{translate('Benefit')}: {scheme.benefit}</Text>
                <Text style={styles.schemeReasonsLabel}>{translate('Why it fits')}:</Text>
                {reasons.map((reason, idx) => (
                  <Text key={idx} style={styles.schemeReason}>
                    • {reason}
                  </Text>
                ))}
                <Text>{translate('Application')}: {scheme.applicationProcess}</Text>
                {scheme.applicationUrl ? (
                  <AppButton mode="outlined" onPress={() => handleOpenUrl(scheme.applicationUrl)} compact>
                    {translate('Open portal')}
                  </AppButton>
                ) : (
                  <AppButton mode="outlined" onPress={() => handleOpenUrl()} compact>
                    {translate('See details')}
                  </AppButton>
                )}
                <Text style={styles.schemeMeta}>{translate('Timeline')}: {scheme.timeline}</Text>
                <Text style={styles.schemeMeta}>{translate('Vendors')}: {scheme.vendorInfo}</Text>
                <Text style={styles.schemeMeta}>{translate('Notes')}: {scheme.notes}</Text>
              </View>
            ))
          )}
        </Surface>

        <AppButton mode="outlined" onPress={showImageOptions} style={styles.imageButton}>
          {imageUri ? translate('Change image') : translate('Add documents')}
        </AppButton>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : null}

        <AppButton mode="contained" onPress={() => navigation.goBack()}>
          {translate('Back')}
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
  filterContainer: {
    gap: 12,
    marginBottom: 8,
  },
  filterGroup: {
    gap: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 16,
  },
  filterLabel: {
    color: '#1E293B',
  },
});
