import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Alert, Image, View, Linking } from 'react-native';
import { Text, Surface, Chip, List } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import * as ImagePicker from 'expo-image-picker';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { getSchemeFilterOptions, SchemeCoverage } from '../../utils/schemeMatcher';
import { useTranslation } from '../../hooks/useTranslation';
import { colors, radii, spacing } from '../../styles/tokens';

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
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  if (!result) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{translate('No results to show')}</Text>
      </View>
    );
  }

  const { grossCost, central, stateSubsidy, netCost, systemKw } = result;

  const estimatedAnnualSavings = useMemo(() => {
    const monthlyBill = Number(answers?.monthlyBill ?? 0);
    if (monthlyBill > 0) {
      return monthlyBill * 12 * 0.6;
    }
    return systemKw * 1100 * 6;
  }, [answers, systemKw]);

  const profileTags = useMemo(() => {
    const tags: string[] = [];
    if (answers?.state) {
      tags.push(answers.state);
    }
    if (answers?.consumerSegment) {
      const segmentMap: Record<string, string> = {
        residential: translate('Residential'),
        agricultural: translate('Agricultural'),
        community: translate('Community / cooperative'),
      };
      tags.push(segmentMap[answers.consumerSegment] ?? answers.consumerSegment);
    }
    if (answers?.ownership) {
      tags.push(answers.ownership === 'yes' ? translate('Owner occupied') : translate('Tenant / shared ownership'));
    }
    if (answers?.gridConnection) {
      tags.push(
        answers.gridConnection === 'grid'
          ? translate('Grid-connected site')
          : translate('Off-grid / unreliable grid')
      );
    }
    return tags;
  }, [answers, translate]);

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

        {profileTags.length > 0 && (
          <Surface style={[styles.surface, styles.personaSurface]} elevation={1}>
            <Text variant="titleMedium">{translate('Your profile snapshot')}</Text>
            <View style={styles.tagRow}>
              {profileTags.map(tag => (
                <Chip key={tag} style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
            </View>
          </Surface>
        )}

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

        <Surface style={[styles.surface, styles.vendorCta]} elevation={1}>
          <Text variant="titleMedium">{translate('Ready to talk to installers?')}</Text>
          <Text style={styles.vendorCopy}>
            {translate('Based on your profile you could save around')} ₹{Math.round(estimatedAnnualSavings).toLocaleString()}{' '}
            {translate('each year.')}
          </Text>
          <AppButton
            onPress={() =>
              navigation.navigate('SubsidyVendors', {
                recommendedKw: systemKw,
                estimatedAnnualSavings,
              })
            }
          >
            {translate('Browse installers & quotes')}
          </AppButton>
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
            <List.Section style={styles.schemeList}>
              {filteredMatches.map(({ scheme, matchScore, reasons }) => {
                const isExpanded = expandedSchemeId === scheme.id;
                return (
                  <List.Accordion
                    key={scheme.id}
                    title={scheme.name}
                    description={`${translate('Administered by')}: ${scheme.administrator}`}
                    expanded={isExpanded}
                    onPress={() => setExpandedSchemeId(prev => (prev === scheme.id ? null : scheme.id))}
                    titleStyle={styles.schemeTitle}
                    descriptionStyle={styles.schemeDescription}
                    style={styles.schemeAccordion}
                  >
                    <View style={styles.schemeBody}>
                      <Text style={styles.schemeMetaLine}>
                        {translate('Match score')}: {matchScore.toFixed(1)}
                      </Text>
                      <Text style={styles.schemeMetaLine}>
                        {translate('Subsidy type')}: {scheme.subsidyType}
                      </Text>
                      <Text style={styles.schemeMetaLine}>
                        {translate('Benefit')}: {scheme.benefit}
                      </Text>
                      <Text style={[styles.schemeMetaLine, styles.schemeReasonsLabel]}>
                        {translate('Why it fits')}:
                      </Text>
                      {reasons.map((reason, idx) => (
                        <Text key={idx} style={styles.schemeReason}>
                          • {reason}
                        </Text>
                      ))}
                      <Text style={styles.schemeMetaLine}>
                        {translate('Application')}: {scheme.applicationProcess}
                      </Text>
                      {scheme.applicationUrl ? (
                        <AppButton mode='outlined' onPress={() => handleOpenUrl(scheme.applicationUrl)} compact>
                          {translate('Open portal')}
                        </AppButton>
                      ) : (
                        <AppButton mode='outlined' onPress={() => handleOpenUrl()} compact>
                          {translate('See details')}
                        </AppButton>
                      )}
                      <Text style={styles.schemeMeta}>
                        {translate('Timeline')}: {scheme.timeline}
                      </Text>
                      <Text style={styles.schemeMeta}>
                        {translate('Vendors')}: {scheme.vendorInfo}
                      </Text>
                      <Text style={styles.schemeMeta}>
                        {translate('Notes')}: {scheme.notes}
                      </Text>
                    </View>
                  </List.Accordion>
                );
              })}
            </List.Section>
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
    gap: spacing.xl,
  },
  surface: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  matchSurface: {
    gap: spacing.lg,
  },
  highlight: {
    color: colors.primary,
  },
  personaSurface: {
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagChip: {
    backgroundColor: colors.palette.mint100,
    marginBottom: spacing.xs / 2,
  },
  total: {
    marginTop: spacing.xs,
    fontWeight: '700',
    color: colors.primaryText,
  },
  imageButton: {
    marginTop: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
  },
  errorText: {
    color: '#b00020',
  },
  schemeTitle: {
    fontSize: 16,
    fontFamily: 'OpenSauce-Bold',
    color: colors.primaryText,
  },
  schemeDescription: {
    color: colors.secondaryText,
  },
  schemeReasonsLabel: {
    marginTop: spacing.xs,
    fontFamily: 'OpenSauce-Bold',
    color: colors.primaryText,
  },
  schemeReason: {
    marginLeft: spacing.xs,
    color: colors.secondaryText,
  },
  schemeMeta: {
    color: colors.tertiaryText,
    fontSize: 13,
  },
  schemeMetaLine: {
    color: colors.secondaryText,
    marginBottom: spacing.xs / 1.5,
  },
  schemeList: {
    backgroundColor: 'transparent',
  },
  schemeAccordion: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: spacing.sm,
  },
  schemeBody: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  filterContainer: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  filterGroup: {
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.pill,
  },
  filterLabel: {
    color: colors.primaryText,
  },
  vendorCta: {
    gap: spacing.md,
  },
  vendorCopy: {
    color: colors.secondaryText,
  },
});
