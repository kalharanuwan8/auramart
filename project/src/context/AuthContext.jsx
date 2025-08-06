import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Determine user role
const determineUserRole = (email, userData = null) => {
  if (email === 'admin@auramarket.lk' || email?.toLowerCase().includes('admin@')) {
    return 'admin';
  }
  return userData?.role || userData?.userType || 'customer';
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Try fetching user data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let userRole = determineUserRole(user.email);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          userRole = userData.role || userData.userType || userRole;
        }

        const formattedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: userRole
        };

        setCurrentUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Email login
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let userRole = determineUserRole(email);
    if (userSnap.exists()) {
      userRole = userSnap.data().role || userSnap.data().userType || userRole;
    }

    const formattedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: userRole
    };

    setCurrentUser(formattedUser);
    localStorage.setItem('user', JSON.stringify(formattedUser));
    return formattedUser;
  };

  // ✅ Email signup
  const signup = async (email, password, role = 'customer', additionalData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (additionalData.name) {
      await updateProfile(user, { displayName: additionalData.name });
    }

    const finalRole = determineUserRole(email, { role });

    // Save user in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      role: finalRole,
      displayName: additionalData.name || 'User',
      createdAt: new Date()
    });

    const userData = {
      uid: user.uid,
      email,
      role: finalRole,
      displayName: additionalData.name || 'User'
    };

    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  // ✅ Google Sign-In
  const googleSignIn = async (defaultRole = 'customer') => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let userRole = determineUserRole(user.email, { role: defaultRole });
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: userRole,
        photoURL: user.photoURL,
        createdAt: new Date()
      });
    } else {
      userRole = userSnap.data().role || userRole;
    }

    const formattedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: userRole
    };

    setCurrentUser(formattedUser);
    localStorage.setItem('user', JSON.stringify(formattedUser));
    return formattedUser;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    signup,
    login,
    googleSignIn,
    logout,
    sendEmailVerification,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

function getFirebaseErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'Email already in use.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/user-not-found': return 'No user found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try later.';
    case 'auth/popup-closed-by-user': return 'Sign in was cancelled.';
    case 'auth/account-exists-with-different-credential': return 'Account exists with a different sign-in method.';
    default: return 'An error occurred. Please try again.';
  }
}
