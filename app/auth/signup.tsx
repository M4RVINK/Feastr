import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../config/firebase';  // Firebase config file
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';  // Use axios to make requests to your backend API
import { Config } from '../../app/config/config';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validatePassword = (password: string) => {
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    return password.length >= 6 && hasNumber && hasSymbol;
  };

  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long and include a number and a symbol.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After successful signup, store user info in MongoDB
      await storeUserInMongoDB(user.uid, name, email);

      // Redirect to the home screen after signup
      router.push('/screens/home');
    } catch (error: any) {
      setError('Sign up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to store user data in MongoDB
  const storeUserInMongoDB = async (uid: string, name: string, email: string) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/users`, {
        firebaseUid: uid,  // Match backend field names
        fullName: name,
        email,
      });
      console.log('User stored:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Backend error:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to save user');
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Feastr</Text>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community of food lovers</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {error.includes('email') && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!isPasswordVisible)}
                >
                  <MaterialCommunityIcons
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <MaterialCommunityIcons
                    name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {error.includes('Passwords') && <Text style={styles.errorText}>{error}</Text>}
              {error.includes('Password must') && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    width: '100%',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  signUpButton: {
    backgroundColor: '#1ABC9C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#000',
    fontSize: 16,
  },
  loginLink: {
    color: '#1ABC9C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 8,
  },
});

export default SignUpScreen;
