// Firebase Authentication Service Helpers
// Client-side auth functions

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User name
 * @returns {Promise<Object>} User object
 */
export const signUp = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || displayName,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token for API calls
    const idToken = await user.getIdToken();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      idToken,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen for auth state changes
 * @param {Function} callback - Callback function that receives user object
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user's ID token
 * @returns {Promise<string>} ID token
 */
export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    return await user.getIdToken();
  } catch (error) {
    throw new Error(error.message);
  }
};
