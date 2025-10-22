import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ADMIN_CONFIG, getAdminUserData } from './adminConfig';

// Create admin user in Firebase Auth and Firestore
export const createAdminUser = async () => {
  try {
    // Check if admin user already exists in Firestore
    const adminDocRef = doc(db, 'users', ADMIN_CONFIG.email);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      console.log('Admin user already exists in Firestore');
      return { success: true, message: 'Admin user already exists' };
    }

    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      ADMIN_CONFIG.email, 
      ADMIN_CONFIG.password
    );

    // Store admin user data in Firestore
    await setDoc(adminDocRef, {
      ...getAdminUserData(),
      uid: userCredential.user.uid
    });

    console.log('Admin user created successfully');
    return { success: true, message: 'Admin user created successfully' };
  } catch (error: any) {
    // If user already exists in Auth, just create the Firestore document
    if (error.code === 'auth/email-already-in-use') {
      try {
        const adminDocRef = doc(db, 'users', ADMIN_CONFIG.email);
        await setDoc(adminDocRef, getAdminUserData());
        console.log('Admin user document created in Firestore');
        return { success: true, message: 'Admin user document created' };
      } catch (firestoreError) {
        console.error('Error creating admin document:', firestoreError);
        return { success: false, message: 'Failed to create admin document' };
      }
    }
    
    console.error('Error creating admin user:', error);
    return { success: false, message: error.message };
  }
};

// Sign in admin user and update last login
export const signInAdmin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login in Firestore
    const userDocRef = doc(db, 'users', email);
    await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error('Error signing in admin:', error);
    return { success: false, message: error.message };
  }
};

// Initialize admin setup (call this when app starts)
export const initializeAdmin = async () => {
  try {
    await createAdminUser();
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};