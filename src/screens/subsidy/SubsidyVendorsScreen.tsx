import React, { useMemo } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';
import { Surface, Text, Chip } from 'react-native-paper';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { solarVendors } from '../../data/solarVendors';
import { useTranslation } from '../../hooks/useTranslation';
import { colors, radii, spacing, shadows } from '../../styles/tokens';

const SubsidyVendorsScreen = ({ route, navigation }) => {
  const { translate } = useTranslation();
  const { recommendedKw, estimatedAnnualSavings } = route.params || {};

  const summary = useMemo(() => {
    if (!recommendedKw) {
      return null;
    }
    return {
      recommendedKw,
      estimatedAnnualSavings,
    };
  }, [recommendedKw, estimatedAnnualSavings]);

  const handleVisit = (url?: string) => {
    if (!url) {
      return;
    }
    Linking.openURL(url).catch(() => {
      // no-op, keep UX simple for now
    });
  };

  return (
    <FlatList
      contentContainerStyle={layout.scrollContent}
      style={layout.screen}
      data={solarVendors}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={[layout.formCard, styles.formCard]}>
          <CustomJuniorHeader label={translate('Installer marketplace')} />
          <Text style={styles.introCopy}>
            {translate('Compare trusted vendors, pricing and ratings before you book a site visit.')}
          </Text>
          {summary && (
            <Surface style={styles.summarySurface} elevation={1}>
              <View style={styles.summaryHeader}>
                <Text variant="labelLarge" style={styles.summaryEyebrow}>
                  {translate('Your solar brief')}
                </Text>
                <Text style={styles.summaryBadge}>{translate('Auto-calculated')}</Text>
              </View>
              <Text style={styles.summaryHighlight}>
                {translate('{size} kW system target').replace('{size}', Number(summary.recommendedKw).toFixed(1))}
              </Text>
              {summary.estimatedAnnualSavings ? (
                <Text style={styles.summaryHint}>
                  {translate('Projected annual savings')}: ₹{Math.round(summary.estimatedAnnualSavings).toLocaleString()}
                </Text>
              ) : (
                <Text style={styles.summaryHint}>{translate('Tip: share your last bill to get sharper quotes.')}</Text>
              )}
            </Surface>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Surface style={styles.vendorCard} elevation={1}>
          <View style={styles.vendorHeader}>
            <Text variant='titleMedium'>{item.name}</Text>
            <Chip icon="star" style={styles.ratingChip}>
              {translate('{rating}★ service').replace('{rating}', item.rating.toFixed(1))}
            </Chip>
          </View>
          <Text style={styles.priceRange}>{item.priceRangeINR}</Text>
          <Text style={styles.basePrice}>
            {translate('Typical turnkey price')}: ₹{Math.round(item.basePricePerKwINR).toLocaleString()}/{translate('kW')}
          </Text>
          <Text style={styles.metaLine}>
            {translate('Serving')}: {item.locations.join(', ')}
          </Text>
          <Text style={styles.metaLine}>
            {translate('{years}+ years in solar').replace('{years}', item.yearsExperience.toString())}
          </Text>
          <View style={styles.highlightRow}>
            {item.highlights.map(highlight => (
              <Chip key={highlight} compact style={styles.highlightChip}>
                {highlight}
              </Chip>
            ))}
          </View>
          {item.contact && <Text style={styles.metaLine}>{translate('Contact')}: {item.contact}</Text>}
          <AppButton
            mode="outlined"
            onPress={() => handleVisit(item.website)}
            disabled={!item.website}
          >
            {translate('Visit website')}
          </AppButton>
        </Surface>
      )}
      ListFooterComponent={
        <View style={styles.footerActions}>
          <AppButton onPress={() => navigation.goBack()} mode="outlined">
            {translate('Back to subsidies')}
          </AppButton>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

export default SubsidyVendorsScreen;

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md,
  },
  introCopy: {
    color: colors.secondaryText,
  },
  summarySurface: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.soft,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryEyebrow: {
    color: colors.secondaryText,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 1.5,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderRadius: radii.pill,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryHighlight: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
  },
  summaryHint: {
    color: colors.tertiaryText,
  },
  vendorCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingChip: {
    backgroundColor: 'rgba(250, 204, 21, 0.16)',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  basePrice: {
    color: colors.secondaryText,
  },
  metaLine: {
    color: colors.tertiaryText,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  highlightChip: {
    backgroundColor: 'rgba(14, 116, 144, 0.12)',
  },
  footerActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
});

