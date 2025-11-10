import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';

const SubsidyResultsScreen = ({ route, navigation }) => {
  const { answers, result } = route.params || {};

  if (!result) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No results to show</Text>
      </View>
    );
  }

  const { grossCost, central, stateSubsidy, netCost, systemKw } = result;

  const docs = [
    'Identity proof (Aadhaar)',
    'Address proof',
    'Property proof / Sale deed',
    'Latest electricity bill (last 3 months)',
    'Bank details for subsidy transfer',
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <CustomHeader label="Estimate" subheading="Indicative subsidy & net cost" image_url={null} />

        <CustomJuniorHeader label={'Summary'} action={() => { }} />

        <View style={{ padding: 16, gap: 12 }}>
          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Recommended system size</Text>
            <Text>{systemKw.toFixed(2)} kW</Text>
          </Surface>

          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Cost breakdown</Text>
            <Text>Gross system cost: ₹{Math.round(grossCost).toLocaleString()}</Text>
            <Text>Central subsidy: ₹{Math.round(central).toLocaleString()}</Text>
            <Text>State/DISCOM subsidy: ₹{Math.round(stateSubsidy).toLocaleString()}</Text>
            <Text style={{ marginTop: 6, fontWeight: '700' }}>Estimated net cost: ₹{Math.round(netCost).toLocaleString()}</Text>
          </Surface>

          <Surface style={{ padding: 12 }}>
            <Text variant="titleMedium">Documents typically required</Text>
            {docs.map((d, i) => (
              <Text key={i}>• {d}</Text>
            ))}
          </Surface>

          <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>Back</Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubsidyResultsScreen;
