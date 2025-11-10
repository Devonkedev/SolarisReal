import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { register } from '../../config/firebase';
import CustomHeader from '../../components/CustomHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import { layout } from '../../styles/layout';

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert('Missing information', 'Please complete your name, email and password.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      Alert.alert('Welcome aboard!', 'Your account is ready. You can sign in now.');
      navigation.navigate('LoginScreen');
    } catch (error) {
      const message = error?.message || 'Unable to create your account. Please try again.';
      Alert.alert('Something went wrong', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={layout.scrollContent} style={layout.screen}>
      <CustomHeader label="Create your account" subheading="A few quick details to unlock your solar toolkit" />
      <View style={layout.formCard}>
        <AppTextInput label="Full name" value={name} onChangeText={setName} />
        <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <AppTextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

        <AppButton onPress={handleSignup} loading={loading}>
          Register
        </AppButton>

        <Text style={{ textAlign: 'center' }} onPress={() => navigation.navigate('LoginScreen')}>
          Already have an account?{' '}
          <Text style={{ fontFamily: 'OpenSauce-Bold' }}>
            Sign in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
