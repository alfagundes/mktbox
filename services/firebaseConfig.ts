// src/services/firebaseConfig.ts
import { initializeApp }            from 'firebase/app';
import { getAuth }                 from 'firebase/auth';
import { getFirestore }            from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAiYSdvqw0KmIWrkgM7ZgXAbatwy3x8UT0',
  authDomain:        'AUTH_DOMAIN',
  projectId:         'mktbox-1384',
  storageBucket:     'STORAGE_BUCKET',
  messagingSenderId: 'SENDER_ID',
  appId:             'APP_ID'
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);