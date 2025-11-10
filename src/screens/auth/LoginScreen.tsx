import { Alert, ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import { login } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    if (!email || !password) {
      setLoading(false);
      Alert.alert('Required fields', 'Please enter your email and password to continue.');
      return;
    }
    try {
      await login(email, password);
      Alert.alert('Success', 'You are now logged in!');
    } catch (error) {
      const message = error?.message || 'Something went wrong';
      Alert.alert('Unable to login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader label="Welcome back" subheading="Sign in to manage your solar journey" />
      <View style={layout.formCard}>
        <AppTextInput label="Email" value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
        <AppTextInput
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          autoCapitalize="none"
        />

        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="labelMedium" onPress={() => navigation.navigate('ForgotPassword', {})}>
            Forgot password?
          </Text>
        </View>

        <AppButton onPress={handleLogin} loading={loading}>
          Login
        </AppButton>

        <Text style={{ textAlign: 'center' }} onPress={() => navigation.navigate('RegisterScreen', {})}>
          Don’t have an account?{' '}
          <Text style={{ fontFamily: 'OpenSauce-Bold' }}>
            Sign up
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
