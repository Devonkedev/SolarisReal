import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import { estimateSubsidy, estimateSystemSizeKw } from '../../utils/subsidyCalculator';
import { matchSubsidySchemes } from '../../utils/schemeMatcher';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';
import { colors, radii, shadows, spacing } from '../../styles/tokens';
import AppSelect from '../../components/AppSelect';
import { LinearGradient } from 'expo-linear-gradient';


const SubsidyEligibilityScreen = ({ navigation }) => {
  // BACKEND SCRIPT: Eligibility Matching + Auto-Fill Scraping

// const fs = require("fs");
// const csv = require("csv-parser");
// const puppeteer = require("puppeteer");

// Load and parse schemes from CSV
// function loadSchemes(filePath) {
//   return new Promise((resolve) => {
//     const results = [];
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on("data", (data) => results.push(data))
//       .on("end", () => resolve(results));
//   });
// }

// // Match user input with best schemes
// function matchSchemes(user, schemes) {
//   return schemes
//     .filter((s) => {
//       const locMatch = s.Location?.toLowerCase()?.includes(user.location.toLowerCase());
//       const sectorMatch = s.Sector?.toLowerCase()?.includes(user.buildingType);
//       const incomeMatch = s.Eligibility?.toLowerCase()?.includes(user.incomeCategory) || s.Eligibility === "";
//       return locMatch && sectorMatch && incomeMatch;
//     })
//     .map((s) => ({
//       scheme: s.Scheme,
//       matchScore:
//         (s.Sector?.toLowerCase().includes(user.buildingType) ? 1 : 0) +
//         (s.Location?.toLowerCase()?.includes(user.location.toLowerCase()) ? 1 : 0) +
//         (s.Eligibility?.toLowerCase()?.includes(user.incomeCategory) ? 1 : 0),
//       subsidyType: s["Subsidy Type"],
//       benefit: s["Rate/Value"],
//       applicationLink: s["Application Process"],
//       notes: s.Notes
//     }))
//     .sort((a, b) => b.matchScore - a.matchScore);
// }

// // Puppeteer scraper for autofill
// async function autofillForm(url, userData) {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(url);

//   await page.type("input[name='location']", userData.location);
//   await page.select("select[name='buildingType']", userData.buildingType);
//   await page.type("input[name='monthlyBill']", String(userData.monthlyBill));
//   await page.type("input[name='rooftopSpace']", String(userData.rooftopSpace));
//   await page.select("select[name='ownership']", userData.ownership);
//   await page.select("select[name='connectionType']", userData.connectionType);
//   await page.select("select[name='incomeCategory']", userData.incomeCategory);

//   // Submit or take screenshot
//   // await page.click("button[type='submit']")
//   await page.screenshot({ path: "form-preview.png" });
//   await browser.close();
// }

// // Example execution
// (async () => {
//   const userInput = {
//     location: "Delhi",
//     buildingType: "residential",
//     monthlyBill: 1800,
//     rooftopSpace: 20,
//     ownership: "owner",
//     connectionType: "single-phase",
//     incomeCategory: "general"
//   };

//   const schemes = await loadSchemes("subsidy_schemes.csv");
//   const matches = matchSchemes(userInput, schemes);
//   console.log("Top Matching Schemes:", matches.slice(0, 3));

//   if (matches.length > 0) {
//     await autofillForm(matches[0].applicationLink, userInput);
//   }
// })();

  const { translate } = useTranslation();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState('');
  const [consumerSegment, setConsumerSegment] = useState<'residential' | 'agricultural' | 'community'>('residential');
  const [ownership, setOwnership] = useState('yes');
  const [roofType, setRoofType] = useState('concrete');
  const [roofArea, setRoofArea] = useState('');
  const [annualConsumption, setAnnualConsumption] = useState('');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [gridConnection, setGridConnection] = useState<'grid' | 'off-grid'>('grid');
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);

  const areaNum = useMemo(() => parseFloat(roofArea) || 0, [roofArea]);
  const consumptionNum = useMemo(() => parseFloat(annualConsumption) || 0, [annualConsumption]);
  const monthlyBillNum = useMemo(() => parseFloat(monthlyBill) || 0, [monthlyBill]);

  const recommendedKw = useMemo(() => estimateSystemSizeKw({ roofArea: areaNum, annualConsumptionKWh: consumptionNum }), [
    areaNum,
    consumptionNum,
  ]);

  const preview = useMemo(() => estimateSubsidy(recommendedKw), [recommendedKw]);

  const estimatedAnnualOutput = useMemo(() => recommendedKw * 1100, [recommendedKw]);
  const estimatedAnnualSavings = useMemo(() => {
    if (monthlyBillNum > 0) {
      return monthlyBillNum * 12 * 0.6;
    }
    return estimatedAnnualOutput * 6;
  }, [estimatedAnnualOutput, monthlyBillNum]);

  const showStep = (step: 1 | 2 | 3) => setCurrentStep(step);

  const handleNumbersNext = () => {
    showStep(2);
  };

  const handleCelebrateContinue = () => {
    showStep(3);
  };

  const onSubmit = () => {
    const result = estimateSubsidy(recommendedKw);
    const matches = matchSubsidySchemes(
      {
        state,
        consumerSegment,
        ownsProperty: ownership === 'yes',
        annualConsumptionKWh: consumptionNum || undefined,
        roofAreaSqm: areaNum || undefined,
        isGridConnected: gridConnection === 'grid',
      },
      { limit: 12 }
    );

    navigation.navigate('SubsidyResults', {
      answers: {
        state,
        ownership,
        consumerSegment,
        roofType,
        roofArea: areaNum,
        annualConsumption: consumptionNum,
        gridConnection,
        monthlyBill: monthlyBillNum || undefined,
      },
      result,
      matches,
    });
  };

  const stepsMeta = useMemo(
    () => [
      { id: 1 as const, label: translate('Size your system') },
      { id: 2 as const, label: translate('See your impact') },
      { id: 3 as const, label: translate('Match programmes') },
    ],
    [translate]
  );

  const progressAnim = useRef(new Animated.Value(currentStep / stepsMeta.length));

  useEffect(() => {
    Animated.timing(progressAnim.current, {
      toValue: currentStep / stepsMeta.length,
      duration: 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [currentStep, stepsMeta.length]);

  const renderStepper = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.stepper}>
        {stepsMeta.map((step, index) => {
          const status = currentStep === step.id ? 'active' : currentStep > step.id ? 'complete' : 'pending';
          return (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    status === 'active' && styles.stepCircleActive,
                    status === 'complete' && styles.stepCircleComplete,
                  ]}
                >
                  <Text
                    variant="labelLarge"
                    style={[
                      styles.stepNumber,
                      (status === 'active' || status === 'complete') && styles.stepNumberActive,
                    ]}
                  >
                    {step.id}
                  </Text>
                </View>
                <Text
                  variant="labelLarge"
                  style={[
                    styles.stepLabel,
                    status === 'active' && styles.stepLabelActive,
                    status === 'complete' && styles.stepLabelComplete,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {index < stepsMeta.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    (currentStep > step.id || status === 'complete') && styles.stepLineActive,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={[colors.palette.indigo900, colors.palette.indigo600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              {translate('Unlock your solar subsidy')}
            </Text>
            <Text variant="bodyMedium" style={styles.heroSubtitle}>
              {translate('Take three quick steps to size your system, preview savings, and match the best programmes for your rooftop.')}
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>3</Text>
                <Text style={styles.heroStatLabel}>{translate('guided steps')}</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>12+</Text>
                <Text style={styles.heroStatLabel}>{translate('schemes compared')}</Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>₹</Text>
                <Text style={styles.heroStatLabel}>{translate('personalised savings')}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={[layout.formCard, styles.formCard]}>
        <CustomJuniorHeader label={translate('Eligibility journey')} />
        {renderStepper()}
        <View
          style={styles.progressBarTrack}
          onLayout={event => setProgressTrackWidth(event.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              progressTrackWidth
                ? {
                    width: progressAnim.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, progressTrackWidth],
                    }),
                  }
                : { width: 0 },
            ]}
          />
        </View>
        <Text variant="labelLarge" style={styles.stepIndicator}>
          {`${translate('Step')} ${currentStep} ${translate('of')} ${stepsMeta.length}`}
        </Text>

        {currentStep === 1 && (
          <>
            <Text variant="bodyMedium" style={styles.introText}>
              {translate('Let’s start with the hard numbers so we can size your solar dream accurately.')}
            </Text>

            <AppTextInput
              label={translate('Usable rooftop area (sq.m)')}
              value={roofArea}
              onChangeText={setRoofArea}
              keyboardType="numeric"
            />
            <AppTextInput
              label={translate('Annual electricity consumption (kWh)')}
              value={annualConsumption}
              onChangeText={setAnnualConsumption}
              keyboardType="numeric"
            />
            <AppTextInput
              label={translate('Average monthly electricity bill (₹)')}
              value={monthlyBill}
              onChangeText={setMonthlyBill}
              keyboardType="numeric"
            />

            <AppButton onPress={handleNumbersNext}>{translate('Next: Preview your savings')}</AppButton>
          </>
        )}

        {currentStep === 2 && (
          <View style={styles.congratsCard}>
            <Text variant="headlineSmall" style={styles.congratsTitle}>
              {translate('Congratulations!')}
            </Text>
            <Text variant="bodyLarge" style={styles.congratsBody}>
              {translate('With a {size} kW rooftop solar system you can start banking sunshine.').replace(
                '{size}',
                recommendedKw.toFixed(1)
              )}
            </Text>
            <View style={styles.highlightBox}>
              <Text variant="labelLarge" style={styles.highlightLabel}>
                {translate('Your solar impact')}
              </Text>
              <Text style={styles.highlightValue}>{estimatedAnnualOutput.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh</Text>
              <Text style={styles.highlightHint}>{translate('Annual clean energy generation')}</Text>
              <Text style={[styles.highlightValue, styles.highlightSavings]}>
                ₹{Math.round(estimatedAnnualSavings).toLocaleString()}
              </Text>
              <Text style={styles.highlightHint}>
                {translate('Estimated savings once your panels are up')}
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.congratsBody}>
              {translate('Keep going to see the subsidies you unlock and the programmes tailored for you.')}
            </Text>
            <Text style={styles.highlightHint}>
              {translate('Estimated post-subsidy investment')}: ₹{Math.round(preview.netCost).toLocaleString()}
            </Text>
            <AppButton onPress={handleCelebrateContinue}>{translate('Continue to programme match')}</AppButton>
            <AppButton onPress={() => showStep(1)} mode="outlined">
              {translate('Adjust my numbers')}
            </AppButton>
          </View>
        )}

        {currentStep === 3 && (
          <>
            <Text variant="bodyMedium" style={styles.introText}>
              {translate('Great! Now tell us a bit about your site so we can match regional incentives.')}
            </Text>

            <AppSelect
              label={translate('State')}
              value={state}
              onSelect={setState}
              options={INDIAN_STATES}
              placeholder={translate('Select state / union territory')}
            />

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Consumer type')}
              </Text>
              <SegmentedButtons
                value={consumerSegment}
                onValueChange={val => setConsumerSegment(val as typeof consumerSegment)}
                buttons={[
                  { value: 'residential', label: translate('Residential') },
                  { value: 'agricultural', label: translate('Agricultural') },
                  { value: 'community', label: translate('Community / cooperative') },
                ]}
                density="small"
                style={styles.segmented}
              />
            </View>

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Do you own the property?')}
              </Text>
              <SegmentedButtons
                value={ownership}
                onValueChange={setOwnership}
                buttons={[
                  { value: 'yes', label: translate('Yes') },
                  { value: 'no', label: translate('No') },
                ]}
                density="small"
                style={styles.segmented}
              />
            </View>

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Do you have an existing grid connection?')}
              </Text>
              <SegmentedButtons
                value={gridConnection}
                onValueChange={val => setGridConnection(val as typeof gridConnection)}
                buttons={[
                  { value: 'grid', label: translate('Grid-connected') },
                  { value: 'off-grid', label: translate('Off-grid / unreliable') },
                ]}
                density="small"
                style={styles.segmented}
              />
            </View>

            <AppTextInput label={translate('Roof type (concrete / tin / tiles)')} value={roofType} onChangeText={setRoofType} />

            <AppButton onPress={onSubmit}>{translate('Check eligibility & estimate')}</AppButton>
            <AppButton onPress={() => showStep(2)} mode="outlined">
              {translate('Back to savings')}
            </AppButton>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SubsidyEligibilityScreen;

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.xl,
  },
  heroWrapper: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroGradient: {
    padding: spacing.xl,
  },
  heroContent: {
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.card,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(248, 250, 252, 0.88)',
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  heroStat: {
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  heroStatNumber: {
    color: colors.card,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  heroStatLabel: {
    color: 'rgba(226, 232, 240, 0.88)',
    fontSize: 12,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  stepCircleComplete: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
  },
  stepNumber: {
    color: colors.secondaryText,
  },
  stepNumberActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepLabel: {
    color: colors.secondaryText,
    maxWidth: 180,
  },
  stepLabelActive: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  stepLabelComplete: {
    color: colors.success,
  },
  stepLine: {
    height: 2,
    width: 28,
    backgroundColor: colors.borderMuted,
    borderRadius: radii.pill,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.borderMuted,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepIndicator: {
    color: colors.secondaryText,
  },
  introText: {
    color: colors.primaryText,
  },
  congratsCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.subtle,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  congratsTitle: {
    color: colors.success,
    fontWeight: '700',
  },
  congratsBody: {
    color: colors.primaryText,
  },
  group: {
    backgroundColor: colors.cardAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  groupLabel: {
    color: colors.primaryText,
  },
  highlightBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: radii.lg,
    padding: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.18)',
  },
  highlightLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.info,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
  },
  highlightHint: {
    color: colors.tertiaryText,
    fontSize: 13,
  },
  highlightSavings: {
    color: colors.success,
  },
  segmented: {
    marginTop: spacing.xs,
  },
});

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];
