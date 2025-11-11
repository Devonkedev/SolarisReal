import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import { estimateSubsidy, estimateSystemSizeKw } from '../../utils/subsidyCalculator';
import { matchSubsidySchemes } from '../../utils/schemeMatcher';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';


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

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label={translate('Subsidy eligibility')}
        subheading={translate('Tell us about your site and we’ll surface the best-matched programmes.')}
        image_url="https://i.postimg.cc/CLkyNwZT/Screenshot-2025-11-10-at-5-03-23-PM.png"
      />

      <View style={[layout.formCard, styles.formCard]}>
        <CustomJuniorHeader label={translate('Eligibility journey')} />
        <Text variant="labelLarge" style={styles.stepIndicator}>
          {`${translate('Step')} ${currentStep} ${translate('of')} 3`}
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

            <AppTextInput label={translate('State')} value={state} onChangeText={setState} />

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Consumer type')}
              </Text>
              <RadioButton.Group onValueChange={v => setConsumerSegment(v as typeof consumerSegment)} value={consumerSegment}>
                <RadioButton.Item label={translate('Residential')} value="residential" />
                <RadioButton.Item label={translate('Agricultural')} value="agricultural" />
                <RadioButton.Item label={translate('Community / cooperative')} value="community" />
              </RadioButton.Group>
            </View>

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Do you own the property?')}
              </Text>
              <RadioButton.Group onValueChange={v => setOwnership(v)} value={ownership}>
                <RadioButton.Item label={translate('Yes')} value="yes" />
                <RadioButton.Item label={translate('No')} value="no" />
              </RadioButton.Group>
            </View>

            <View style={styles.group}>
              <Text variant="labelLarge" style={styles.groupLabel}>
                {translate('Do you have an existing grid connection?')}
              </Text>
              <RadioButton.Group onValueChange={v => setGridConnection(v as typeof gridConnection)} value={gridConnection}>
                <RadioButton.Item label={translate('Yes, grid-connected')} value="grid" />
                <RadioButton.Item label={translate('No, off-grid / unreliable grid')} value="off-grid" />
              </RadioButton.Group>
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
    gap: 20,
  },
  stepIndicator: {
    color: '#475569',
  },
  introText: {
    color: '#0F172A',
  },
  congratsCard: {
    gap: 16,
    alignItems: 'flex-start',
  },
  congratsTitle: {
    color: '#047857',
    fontWeight: '700',
  },
  congratsBody: {
    color: '#0F172A',
  },
  group: {
    backgroundColor: 'rgba(226, 232, 240, 0.25)',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  groupLabel: {
    color: '#0F172A',
  },
  highlightBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 18,
    padding: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
  },
  highlightLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#047857',
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  highlightHint: {
    color: '#334155',
    fontSize: 13,
  },
  highlightSavings: {
    color: '#047857',
  },
});
