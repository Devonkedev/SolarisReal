import { View, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, TextInput, Menu } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { addTracker } from '../../config/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

// Types/categories for energy entries.
const OPTIONS = [
    { label: 'Generation', value: 'generation' },
    { label: 'Consumption', value: 'consumption' },
    { label: 'Export', value: 'export' },
    { label: 'Other', value: 'other' },
];

const AddTrackerScreen = ({ navigation }) => {
    const [kwh, setKwh] = useState('');
    const [revenue, setRevenue] = useState('');
    const [panelId, setPanelId] = useState('');
    const [type, setType] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [dateVisible, setDateVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);

        const parsedKwh = parseFloat(kwh);
        const parsedRevenue = parseFloat(revenue || '0');
        if (isNaN(parsedKwh) || parsedKwh <= 0) {
            Alert.alert("Error", "Please enter a valid kWh value greater than 0");
            setLoading(false);
            return;
        }
        if (!type) {
            Alert.alert("Error", "Please select a type (Generation/Consumption)");
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
            Alert.alert("Success", "Entry saved!", [
                { text: "OK", onPress: () => navigation.navigate("TrackerScreen") }
            ]);
        } catch (error) {
            console.error("Error saving tracker:", error);
            Alert.alert("Error", "Failed to save entry");
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
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSelectedCategoryLabel = () => {
        const selected = OPTIONS.find(opt => opt.value === type);
        return selected ? selected.label : 'Select type';
    };

    return (
        <ScrollView contentContainerStyle={{
            gap: wp(5),
            paddingHorizontal: wp(5),
            paddingBottom: wp(10),
        }}>
            <CustomHeader
                label="Add Energy Entry"
                subheading="Record generated/consumed energy and value"
                image_url="https://static.vecteezy.com/system/resources/previews/018/231/411/non_2x/solar-panel-energy-icon-vector.jpg"
            />

            <TextInput
                label="kWh"
                value={kwh}
                onChangeText={setKwh}
                mode="outlined"
                keyboardType="numeric"
            />

            <TextInput
                label="Monetary value (e.g. revenue/savings)"
                value={revenue}
                onChangeText={setRevenue}
                mode="outlined"
                keyboardType="numeric"
            />

            <TextInput
                label="Panel ID (optional)"
                value={panelId}
                onChangeText={setPanelId}
                mode="outlined"
            />

            <Menu
                visible={dropdownVisible}
                onDismiss={() => setDropdownVisible(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setDropdownVisible(true)}
                        style={{
                            justifyContent: 'flex-start',
                            paddingVertical: 8,
                        }}
                        contentStyle={{
                            justifyContent: 'flex-start',
                        }}
                        labelStyle={{
                            textAlign: 'left',
                            color: type ? '#000' : '#666',
                        }}
                    >
                        {getSelectedCategoryLabel()}
                    </Button>
                }
                contentStyle={{ marginTop: wp(2) }}
            >
                {OPTIONS.map((option) => (
                    <Menu.Item
                        key={option.value}
                        onPress={() => {
                            setType(option.value);
                            setDropdownVisible(false);
                        }}
                        title={option.label}
                        titleStyle={{
                            color: type === option.value ? '#6200ea' : '#000'
                        }}
                    />
                ))}
            </Menu>

            <Button
                mode="outlined"
                onPress={() => setDateVisible(true)}
                style={{
                    justifyContent: 'flex-start',
                    paddingVertical: 8,
                }}
                contentStyle={{
                    justifyContent: 'flex-start',
                }}
                icon="calendar"
            >
                {formatDate(inputDate)}
            </Button>

            {dateVisible && (
                <DateTimePicker
                    value={inputDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                />
            )}

            <TextInput
                multiline
                numberOfLines={4}
                label="Note (optional)"
                value={note}
                onChangeText={setNote}
                style={{ height: 100 }}
                mode="outlined"
            />

            <Button
                icon="check"
                mode="contained"
                loading={loading}
                onPress={handleSave}
                disabled={loading}
                style={{ marginTop: wp(2) }}
            >
                Save Entry
            </Button>
            <Button mode="contained" onPress={() => navigation.replace("TrackerScreen") }>
                Go back
            </Button>
        </ScrollView>
    );
};

export default AddTrackerScreen;
