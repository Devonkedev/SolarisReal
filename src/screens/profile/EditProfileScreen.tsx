import { View, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { Button, FAB, TextInput } from 'react-native-paper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { auth, getUserProfile, updateUserProfile } from '../../config/firebase';
import { useTranslation } from '../../hooks/useTranslation';

const EditProfileScreen = ({ navigation }) => {
  const { translate } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setName(profile.name || '');
        setEmail(profile.email || '');
        setDob(profile.dob || '');
        setPhone(profile.phone || '');
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        Alert.alert(translate('Error'), translate('Unable to fetch profile data.'));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        name,
        email,
        dob,
        phone,
      });
      Alert.alert(translate('Success'), translate('Profile updated successfully!'));
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(translate('Error'), translate('Failed to update profile.'));
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   await auth.signOut();
  // };

  return (
    <View style={{
      flex: 1,
    }}>
      <ScrollView contentContainerStyle={{ padding: wp(4) }}>
        <CustomHeader
          label={translate('Profile')}
          subheading={translate('Here you can edit your profile.')}
          image_url={
            'https://i.postimg.cc/850GGdyL/Screenshot-2025-09-27-at-1-13-48-PM.png'
          }
        />

        <View style={{ marginBottom: wp(6) }}>
          <TextInput
            label={translate('Name')}
            value={name}
            onChangeText={setName}
            style={{ marginBottom: wp(3) }}
          />
          <TextInput
            label={translate('Email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: wp(3) }}
          />
          <TextInput
            label={translate('Phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ marginBottom: wp(3) }}
          />
          <TextInput
            label={translate('Date of birth (YYYY-MM-DD)')}
            value={dob}
            onChangeText={setDob}
            placeholder={translate('1990-05-15')}
            style={{ marginBottom: wp(3) }}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={loading}
          disabled={loading}
          style={{ marginBottom: wp(5) }}
        >
          {translate('Save profile')}
        </Button>

        {/* <Button mode="outlined" onPress={handleLogout}>
        Logout
      </Button> */}

        <Button mode="outlined" onPress={() => {
          navigation.replace("ProfileScreen");
        }}>
          {translate('Exit')}
        </Button>


      </ScrollView>
      <FAB
        icon="pen"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handleSaveProfile}
        accessibilityLabel={translate('Save profile')}
      />
    </View>
  );
};

export default EditProfileScreen;
