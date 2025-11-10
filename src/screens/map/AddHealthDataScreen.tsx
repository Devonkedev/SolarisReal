import { ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import { addHealthLog, addHealthStat } from '../../config/firebase';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import CustomHeader from '../../components/CustomHeader';
import { layout } from '../../styles/layout';

const AddHealthDataScreen = ({ navigation }) => {
  const [statKey, setStatKey] = useState('');
  const [statValue, setStatValue] = useState('');
  const [logText, setLogText] = useState('');

  const handleAddStat = async () => {
    if (!statKey || !statValue) return;
    await addHealthStat(statKey, statValue);
    setStatKey('');
    setStatValue('');
  };

  const handleAddLog = async () => {
    if (!logText) return;
    await addHealthLog(logText);
    setLogText('');
  };

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader
        label="Wellness tracker"
        subheading="Log key vitals and notes to keep your health data in sync with your solar routine."
      />

      <View style={layout.formCard}>
        <Text variant="titleMedium">Add health stat</Text>
        <AppTextInput
          label="Stat name (e.g. blood pressure)"
          value={statKey}
          onChangeText={setStatKey}
        />
        <AppTextInput
          label="Stat value (e.g. 120/80 mmHg)"
          value={statValue}
          onChangeText={setStatValue}
        />
        <AppButton onPress={handleAddStat}>Save stat</AppButton>

        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          Add health log
        </Text>
        <AppTextInput
          label="Log description"
          multiline
          value={logText}
          onChangeText={setLogText}
        />
        <AppButton onPress={handleAddLog}>Save log</AppButton>
        <AppButton mode="outlined" onPress={() => navigation.replace('HealthScreen')}>
          Go back
        </AppButton>
      </View>
    </ScrollView>
  );
};

export default AddHealthDataScreen;
