// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const combinedUserData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData.name || firebaseUser.email.split('@')[0],
          userType: userData.userType || 'customer',
          avatar: firebaseUser.photoURL || userData.avatar || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=150',
          ...userData
        };
        setUser(combinedUserData);
        localStorage.setItem('user', JSON.stringify(combinedUserData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, userType) => {
    try {
      // Admin credentials check
      if (userType === 'admin') {
        if (email !== 'admin@auramarket.lk' || password !== 'admin123') {
          throw new Error('Invalid admin credentials');
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Ensure userType matches
      if (userData.userType && userData.userType !== userType) {
        throw new Error('Invalid user type for this account');
      }

      const combinedUserData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || userData.name || firebaseUser.email.split('@')[0],
        userType: userType,
        avatar: firebaseUser.photoURL || userData.avatar || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=150',
        ...userData
      };

      setUser(combinedUserData);
      localStorage.setItem('user', JSON.stringify(combinedUserData));
      return combinedUserData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const signup = async (email, password, userType, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        userType,
        name: additionalData.name || firebaseUser.email.split('@')[0],
        avatar: firebaseUser.photoURL || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=150',
        phone: additionalData.phone || '',
        ...(userType === 'seller' && {
          storeName: additionalData.storeName || '',
          storeDescription: additionalData.storeDescription || ''
        })
      };

      // Store user data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const googleSignIn = async (userType) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData;

      if (!userDoc.exists()) {
        // New user, create Firestore entry
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          userType,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.photoURL || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=150',
          phone: ''
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        userData = userDoc.data();
        // Ensure userType matches
        if (userData.userType !== userType) {
          throw new Error('This Google account is registered as a different user type');
        }
      }

      const combinedUserData = {
        ...userData,
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || userData.name,
        avatar: firebaseUser.photoURL || userData.avatar
      };

      setUser(combinedUserData);
      localStorage.setItem('user', JSON.stringify(combinedUserData));
      return combinedUserData;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    login,
    signup,
    googleSignIn,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};