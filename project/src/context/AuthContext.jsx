import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Dummy user data
const DUMMY_USERS = {
  'admin@auramarket.lk': {
    uid: 'admin123',
    email: 'admin@auramarket.lk',
    displayName: 'Admin User',
    photoURL: 'https://example.com/admin-avatar.png',
    emailVerified: true,
    role: 'admin'
  },
  'user@example.com': {
    uid: 'user123',
    email: 'user@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/user-avatar.png',
    emailVerified: true,
    role: 'customer'
  }
};

const determineUserRole = (email) => {
  if (email === 'admin@auramarket.lk' || email?.toLowerCase().includes('admin@')) {
    return 'admin';
  }
  return 'customer';
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth state check
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = DUMMY_USERS[email];
    if (!user || password !== 'password123') {
      throw new Error('auth/wrong-password');
    }

    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  };

  const signup = async (email, password, role = 'customer', additionalData = {}) => {
    // Simulate signup delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (DUMMY_USERS[email]) {
      throw new Error('auth/email-already-in-use');
    }

    const newUser = {
      uid: `user_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName: additionalData.name || 'User',
      photoURL: null,
      emailVerified: false,
      role: determineUserRole(email)
    };

    DUMMY_USERS[email] = newUser;
    setCurrentUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const googleSignIn = async () => {
    // Simulate Google sign-in delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const googleUser = {
      uid: 'google_user123',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/google-avatar.png',
      emailVerified: true,
      role: 'customer'
    };

    setCurrentUser(googleUser);
    localStorage.setItem('user', JSON.stringify(googleUser));
    return googleUser;
  };

  const logout = async () => {
    // Simulate logout delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const resetPassword = async (email) => {
    // Simulate password reset delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!DUMMY_USERS[email]) {
      throw new Error('auth/user-not-found');
    }
    // In a real app, this would send an email
    return true;
  };

  const value = {
    currentUser,
    signup,
    login,
    googleSignIn,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function getFirebaseErrorMessage(code) {
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
