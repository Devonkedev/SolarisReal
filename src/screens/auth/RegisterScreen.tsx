import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { register } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';

const RegisterScreen = ({ navigation }) => {
  const { translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert(translate('Missing information'), translate('Please complete your name, email and password.'));
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      Alert.alert(translate('Welcome aboard!'), translate('Your account is ready. You can sign in now.'));
      navigation.navigate('LoginScreen');
    } catch (error) {
      const message = error?.message || 'Unable to create your account. Please try again.';
      Alert.alert(translate('Something went wrong'), translate(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader label={translate('Create your account')} subheading={translate('A few quick details to unlock your solar toolkit')} />
      <View style={layout.formCard}>
        <AppTextInput label={translate('Full name')} value={name} onChangeText={setName} />
        <AppTextInput label={translate('Email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AppTextInput label={translate('Password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

        <AppButton onPress={handleSignup} loading={loading}>
          {translate('Register')}
        </AppButton>

        <Text style={{ textAlign: 'center' }} onPress={() => navigation.navigate('LoginScreen')}>
          {translate('Already have an account?')}{' '}
          <Text style={{ fontFamily: 'OpenSauce-Bold' }}>
            {translate('Sign in')}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
