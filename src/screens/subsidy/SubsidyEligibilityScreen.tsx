import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, TextInput, RadioButton, Text } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import { estimateSubsidy, estimateSystemSizeKw } from '../../utils/subsidyCalculator';


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

  const [state, setState] = useState('');
  const [ownership, setOwnership] = useState('yes');
  const [roofType, setRoofType] = useState('concrete');
  const [roofArea, setRoofArea] = useState('');
  const [annualConsumption, setAnnualConsumption] = useState('');

  const onSubmit = () => {
    const areaNum = parseFloat(roofArea) || 0;
    const consumptionNum = parseFloat(annualConsumption) || 0;

    const recommendedKw = estimateSystemSizeKw({ roofArea: areaNum, annualConsumptionKWh: consumptionNum });

    const result = estimateSubsidy(recommendedKw);

    navigation.navigate('SubsidyResults', { answers: { state, ownership, roofType, roofArea: areaNum, annualConsumption: consumptionNum }, result });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <CustomHeader label="Subsidy Eligibility" subheading="Check central and state rooftop subsidies" image_url={"https://i.postimg.cc/CLkyNwZT/Screenshot-2025-11-10-at-5-03-23-PM.png"} />

        <CustomJuniorHeader label={'Eligibility questionnaire'} action={() => { }} />

        <View style={{ padding: 16, gap: 12 }}>
          <TextInput label="State" value={state} onChangeText={setState} mode="outlined" />

          <View>
            <Text style={{ marginTop: 8, marginBottom: 4 }}>Do you own the property?</Text>
            <RadioButton.Group onValueChange={v => setOwnership(v)} value={ownership}>
              <RadioButton.Item label="Yes" value="yes" />
              <RadioButton.Item label="No" value="no" />
            </RadioButton.Group>
          </View>

          <TextInput label="Roof type (concrete/tin/tiles)" value={roofType} onChangeText={setRoofType} mode="outlined" />

          <TextInput label="Usable rooftop area (sq.m)" value={roofArea} onChangeText={setRoofArea} mode="outlined" keyboardType="numeric" />

          <TextInput label="Annual electricity consumption (kWh) - optional" value={annualConsumption} onChangeText={setAnnualConsumption} mode="outlined" keyboardType="numeric" />

          <Button mode="contained" onPress={onSubmit} style={{ marginTop: 12 }}>Check eligibility & estimate</Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubsidyEligibilityScreen;
