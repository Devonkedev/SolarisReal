import { View, Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Menu, Text } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import { addTracker } from '../../config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';

const AddTrackerScreen = ({ navigation }) => {
    const { translate } = useTranslation();
    const [kwh, setKwh] = useState('');
    const [revenue, setRevenue] = useState('');
    const [panelId, setPanelId] = useState('');
    const [type, setType] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [dateVisible, setDateVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const options = useMemo(
        () => [
            { label: translate('Generation'), value: 'generation' },
            { label: translate('Consumption'), value: 'consumption' },
            { label: translate('Export'), value: 'export' },
            { label: translate('Other'), value: 'other' },
        ],
        [translate]
    );

    const handleSave = async () => {
        setLoading(true);

        const parsedKwh = parseFloat(kwh);
        const parsedRevenue = parseFloat(revenue || '0');
        if (isNaN(parsedKwh) || parsedKwh <= 0) {
            Alert.alert(translate('Error'), translate('Please enter a valid kWh value greater than 0'));
            setLoading(false);
            return;
        }
        if (!type) {
            Alert.alert(translate('Error'), translate('Please select a type (Generation/Consumption)'));
            setLoading(false);
            return;
        }

        const trackerData = {
            kwh: parsedKwh,
            revenue: isNaN(parsedRevenue) ? 0 : parsedRevenue,
            panelId: panelId || null,
            type,
            date: inputDate.toISOString().split('T')[0],
            note,
            createdAt: new Date().toISOString(),
        };

        try {
            await addTracker(trackerData);
            Alert.alert(translate('Success'), translate('Entry saved!'), [
                { text: translate('OK'), onPress: () => navigation.navigate("TrackerScreen") }
            ]);
        } catch (error) {
            console.error("Error saving tracker:", error);
            Alert.alert(translate('Error'), translate('Failed to save entry'));
        }
        setLoading(false);
    };

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setDateVisible(false);
        }

        if (selectedDate && event.type !== 'dismissed') {
            setInputDate(selectedDate);
        }
    };

    const formatDate = (date) => {
        if (!date) return translate('Select date');
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSelectedCategoryLabel = () => {
        const selected = options.find(opt => opt.value === type);
        return selected ? selected.label : translate('Select type');
    };

    return (
        <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
            <CustomHeader
                label={translate('Add energy entry')}
                subheading={translate('Capture daily generation, consumption or exports in one place.')}
                image_url="https://static.vecteezy.com/system/resources/previews/018/231/411/non_2x/solar-panel-energy-icon-vector.jpg"
            />

            <View style={[layout.formCard, styles.card]}>
                <AppTextInput
                    label={translate('kWh')}
                    value={kwh}
                    onChangeText={setKwh}
                    keyboardType="numeric"
                />

                <AppTextInput
                    label={translate('Monetary value (₹) — optional')}
                    value={revenue}
                    onChangeText={setRevenue}
                    keyboardType="numeric"
                />

                <AppTextInput
                    label={translate('Panel ID (optional)')}
                    value={panelId}
                    onChangeText={setPanelId}
                />

                <Text variant="labelLarge">{translate('Entry type')}</Text>
                <Menu
                    visible={dropdownVisible}
                    onDismiss={() => setDropdownVisible(false)}
                    anchor={
                        <AppButton
                            mode="outlined"
                            onPress={() => setDropdownVisible(true)}
                            style={styles.menuAnchor}
                        >
                            {getSelectedCategoryLabel()}
                        </AppButton>
                    }
                    contentStyle={styles.menuContent}
                >
                    {options.map((option) => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                setType(option.value);
                                setDropdownVisible(false);
                            }}
                            title={option.label}
                            titleStyle={{
                                color: type === option.value ? '#1E3A8A' : '#0F172A',
                            }}
                        />
                    ))}
                </Menu>

                <AppButton
                    mode="outlined"
                    onPress={() => setDateVisible(true)}
                    icon="calendar"
                    style={styles.selector}
                >
                    {formatDate(inputDate)}
                </AppButton>

                {dateVisible && (
                    <DateTimePicker
                        value={inputDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <AppTextInput
                    multiline
                    label={translate('Note (optional)')}
                    value={note}
                    onChangeText={setNote}
                />

                <AppButton
                    icon="check"
                    mode="contained"
                    loading={loading}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {translate('Save entry')}
                </AppButton>
                <AppButton mode="outlined" onPress={() => navigation.replace('TrackerScreen')}>
                    {translate('Go back')}
                </AppButton>
            </View>
        </ScrollView>
    );
};

export default AddTrackerScreen;

const styles = StyleSheet.create({
    card: {
        gap: 18,
    },
    menuAnchor: {
        justifyContent: 'flex-start',
    },
    menuContent: {
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
    },
    selector: {
        justifyContent: 'flex-start',
    },
});
