import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, TextInput, RadioButton, Text } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import { estimateSubsidy, estimateSystemSizeKw } from '../../utils/subsidyCalculator';

const SubsidyEligibilityScreen = ({ navigation }) => {
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
        <CustomHeader label="Subsidy Eligibility" subheading="Check central and state rooftop subsidies" image_url={null} />

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
