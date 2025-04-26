import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from './config';





// Your Firebase config object
const firebaseConfig = {
  apiKey: Config.FIREBASE_KEY,
  authDomain: 'feastr-app.firebaseapp.com',
  projectId: 'feastr-app',
  storageBucket: 'feastr-app.firebasestorage.app',
  messagingSenderId: '407435197828',
  appId: '1:407435197828:web:dd6a60118afc70b48571d1',
  measurementId: 'G-EQZTPKC3H2',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

