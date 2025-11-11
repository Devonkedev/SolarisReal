import { Alert, ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import { login } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';
import { useTranslation } from '../../hooks/useTranslation';

const LoginScreen = ({ navigation }) => {
  const { translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      setLoading(false);
      Alert.alert(translate('Required fields'), translate('Please enter your email and password to continue.'));
      return;
    }
    try {
      await login(email, password);
      Alert.alert(translate('Success'), translate('You are now logged in!'));
    } catch (error) {
      const message = error?.message || 'Something went wrong';
      Alert.alert(translate('Unable to login'), translate(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader label={translate('Welcome back')} subheading={translate('Sign in to manage your solar journey')} />
      <View style={layout.formCard}>
        <AppTextInput label={translate('Email')} value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
        <AppTextInput
          label={translate('Password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          autoCapitalize="none"
        />

        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="labelMedium" onPress={() => navigation.navigate('ForgotPassword', {})}>
            {translate('Forgot password?')}
          </Text>
        </View>

        <AppButton onPress={handleLogin} loading={loading}>
          {translate('Login')}
        </AppButton>

        <Text style={{ textAlign: 'center' }} onPress={() => navigation.navigate('RegisterScreen', {})}>
          {translate('Don’t have an account?')}{' '}
          <Text style={{ fontFamily: 'OpenSauce-Bold' }}>
            {translate('Sign up')}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
