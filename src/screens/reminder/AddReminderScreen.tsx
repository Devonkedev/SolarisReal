import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Menu, Text } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import CustomHeader from '../../components/CustomHeader';
import { addReminder } from '../../config/firebase';
import * as Notifications from 'expo-notifications';
import { scheduleLocalNotification } from '../../utils/notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';

const OPTIONS = [
    { label: 'Medicine', value: 'medicine' },
    { label: 'Doctor Appointment', value: 'doctor' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Other', value: 'other' },
];

const AddReminderScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [inputDate, setInputDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [detail, setDetail] = useState('');
    const [timeVisible, setTimeVisible] = useState(false);
    const [dateVisible, setDateVisible] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);

        if (!name || !type || !inputDate || !time) {
            Alert.alert("Error", "Please fill all required fields");
            setLoading(false);
            return;
        }

        const reminderData = {
            name,
            type,
            date: inputDate.toISOString().split('T')[0],
            time,
            detail,
        };

        try {
            await addReminder(reminderData);
            await scheduleLocalNotification(reminderData);

            Alert.alert("Success", "Reminder saved!", [
                { text: "OK", onPress: () => navigation.navigate("ReminderScreen") }
            ]);
        } catch (error) {
            console.error("Error saving reminder:", error);
            Alert.alert("Error", "Failed to save reminder");
        }
        setLoading(false);
    };

    const onTimeConfirm = ({ hours, minutes }) => {
        setTimeVisible(false);
        const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        setTime(formatted);
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

    const getSelectedTypeLabel = () => {
        const selected = OPTIONS.find(opt => opt.value === type);
        return selected ? selected.label : 'Select reminder type';
    };

    return (
        <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
            <CustomHeader
                label="Add reminder"
                subheading="Set smart nudges so you never miss a pill, scan or appointment."
                image_url="https://static.vecteezy.com/system/resources/previews/029/722/371/non_2x/reminder-icon-in-trendy-flat-style-isolated-on-white-background-reminder-silhouette-symbol-for-your-website-design-logo-app-ui-illustration-eps10-free-vector.jpg"
            />

            <View style={[layout.formCard, styles.card]}>
                <AppTextInput
                    label="Reminder name"
                    value={name}
                    onChangeText={setName}
                />

                <Text variant="labelLarge">Reminder type</Text>
                <Menu
                    visible={dropdownVisible}
                    onDismiss={() => setDropdownVisible(false)}
                    anchor={
                        <AppButton
                            mode="outlined"
                            onPress={() => setDropdownVisible(true)}
                            style={styles.menuAnchor}
                            labelStyle={{ justifyContent: 'flex-start' }}
                        >
                            {getSelectedTypeLabel()}
                        </AppButton>
                    }
                    contentStyle={styles.menuContent}
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
                                color: type === option.value ? '#1E3A8A' : '#0F172A',
                            }}
                        />
                    ))}
                </Menu>

                <AppButton
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setDateVisible(true)}
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
                        minimumDate={new Date()}
                    />
                )}

                <AppButton
                    icon="clock"
                    mode="outlined"
                    onPress={() => setTimeVisible(true)}
                    style={styles.selector}
                >
                    {time ? `Time: ${time}` : 'Pick time'}
                </AppButton>

                <TimePickerModal
                    visible={timeVisible}
                    onDismiss={() => setTimeVisible(false)}
                    onConfirm={onTimeConfirm}
                    hours={12}
                    minutes={0}
                />

                <AppTextInput
                    multiline
                    label="Reminder detail"
                    value={detail}
                    onChangeText={setDetail}
                />

                <AppButton
                    icon="alarm-bell"
                    mode="contained"
                    loading={loading}
                    onPress={handleSave}
                    disabled={loading}
                >
                    Save reminder
                </AppButton>
                <AppButton mode="outlined" onPress={() => navigation.replace('ReminderScreen')}>
                    Go back
                </AppButton>
            </View>
        </ScrollView>
    );
};

export default AddReminderScreen;

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