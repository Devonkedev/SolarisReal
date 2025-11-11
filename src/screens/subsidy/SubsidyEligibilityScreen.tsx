import React, { useState } from 'react';
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

  const [state, setState] = useState('');
  const [consumerSegment, setConsumerSegment] = useState<'residential' | 'agricultural' | 'community'>('residential');
  const [ownership, setOwnership] = useState('yes');
  const [roofType, setRoofType] = useState('concrete');
  const [roofArea, setRoofArea] = useState('');
  const [annualConsumption, setAnnualConsumption] = useState('');
  const [gridConnection, setGridConnection] = useState<'grid' | 'off-grid'>('grid');

  const onSubmit = () => {
    const areaNum = parseFloat(roofArea) || 0;
    const consumptionNum = parseFloat(annualConsumption) || 0;

    const recommendedKw = estimateSystemSizeKw({ roofArea: areaNum, annualConsumptionKWh: consumptionNum });

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
        <CustomJuniorHeader label={translate('Eligibility questionnaire')} />

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
        <AppTextInput
          label={translate('Usable rooftop area (sq.m)')}
          value={roofArea}
          onChangeText={setRoofArea}
          keyboardType="numeric"
        />
        <AppTextInput
          label={translate('Annual electricity consumption (kWh) – optional')}
          value={annualConsumption}
          onChangeText={setAnnualConsumption}
          keyboardType="numeric"
        />

        <AppButton onPress={onSubmit}>
          {translate('Check eligibility & estimate')}
        </AppButton>
      </View>
    </ScrollView>
  );
};

export default SubsidyEligibilityScreen;

const styles = StyleSheet.create({
  formCard: {
    gap: 20,
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
});
