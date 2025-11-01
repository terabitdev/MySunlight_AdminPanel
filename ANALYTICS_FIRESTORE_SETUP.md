# Analytics Firestore Setup Guide

This guide explains how to implement dual-logging for Firebase Analytics events to Firestore, so the Admin Dashboard can access and display analytics data.

## Overview

The Admin Dashboard fetches analytics data from two Firestore collections:
- `analytics_daily_tips` - Tracks when users view daily tips
- `analytics_breathing_exercises` - Tracks breathing exercise usage

## Firestore Collections Structure

### 1. `analytics_daily_tips` Collection

Each document should contain:

```javascript
{
  userId: string,        // User's UID
  tipId: string,         // ID or title of the tip viewed
  timestamp: Timestamp,  // When the tip was viewed
}
```

**Firestore Indexes Required:**
- Collection: `analytics_daily_tips`
- Fields: `userId` (Ascending), `timestamp` (Descending)

### 2. `analytics_breathing_exercises` Collection

Each document should contain:

```javascript
{
  userId: string,        // User's UID
  status: string,        // 'started' or 'completed'
  duration: number,      // Duration in seconds (optional, for completed exercises)
  timestamp: Timestamp,  // When the event occurred
}
```

**Firestore Indexes Required:**
- Collection: `analytics_breathing_exercises`
- Fields: `userId` (Ascending), `timestamp` (Descending)

## Implementation in Mobile App

### React Native / Expo Implementation

```javascript
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// Log Daily Tip View
export const logDailyTipView = async (tipId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await addDoc(collection(db, 'analytics_daily_tips'), {
      userId: userId,
      tipId: tipId,
      timestamp: serverTimestamp(),
    });

    console.log('Daily tip view logged to Firestore');
  } catch (error) {
    console.error('Error logging daily tip view:', error);
  }
};

// Log Breathing Exercise Started
export const logBreathingExerciseStarted = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await addDoc(collection(db, 'analytics_breathing_exercises'), {
      userId: userId,
      status: 'started',
      timestamp: serverTimestamp(),
    });

    console.log('Breathing exercise started logged to Firestore');
  } catch (error) {
    console.error('Error logging breathing exercise start:', error);
  }
};

// Log Breathing Exercise Completed
export const logBreathingExerciseCompleted = async (durationInSeconds) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await addDoc(collection(db, 'analytics_breathing_exercises'), {
      userId: userId,
      status: 'completed',
      duration: durationInSeconds,
      timestamp: serverTimestamp(),
    });

    console.log('Breathing exercise completed logged to Firestore');
  } catch (error) {
    console.error('Error logging breathing exercise completion:', error);
  }
};
```

### Flutter Implementation

```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

final FirebaseFirestore _firestore = FirebaseFirestore.instance;
final FirebaseAuth _auth = FirebaseAuth.instance;

// Log Daily Tip View
Future<void> logDailyTipView(String tipId) async {
  try {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return;

    await _firestore.collection('analytics_daily_tips').add({
      'userId': userId,
      'tipId': tipId,
      'timestamp': FieldValue.serverTimestamp(),
    });

    print('Daily tip view logged to Firestore');
  } catch (e) {
    print('Error logging daily tip view: $e');
  }
}

// Log Breathing Exercise Started
Future<void> logBreathingExerciseStarted() async {
  try {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return;

    await _firestore.collection('analytics_breathing_exercises').add({
      'userId': userId,
      'status': 'started',
      'timestamp': FieldValue.serverTimestamp(),
    });

    print('Breathing exercise started logged to Firestore');
  } catch (e) {
    print('Error logging breathing exercise start: $e');
  }
}

// Log Breathing Exercise Completed
Future<void> logBreathingExerciseCompleted(int durationInSeconds) async {
  try {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return;

    await _firestore.collection('analytics_breathing_exercises').add({
      'userId': userId,
      'status': 'completed',
      'duration': durationInSeconds,
      'timestamp': FieldValue.serverTimestamp(),
    });

    print('Breathing exercise completed logged to Firestore');
  } catch (e) {
    print('Error logging breathing exercise completion: $e');
  }
}
```

## Creating Firestore Indexes

To create the required indexes:

1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Add Index"

**Index 1: analytics_daily_tips**
- Collection ID: `analytics_daily_tips`
- Fields to index:
  - `userId` - Ascending
  - `timestamp` - Descending
- Query scopes: Collection

**Index 2: analytics_breathing_exercises**
- Collection ID: `analytics_breathing_exercises`
- Fields to index:
  - `userId` - Ascending
  - `timestamp` - Descending
- Query scopes: Collection

**OR** you can let Firebase auto-create indexes by:
1. Open the Admin Dashboard
2. Click on a user to view their details
3. Navigate to the "Daily Coping Tools Analytics" tab
4. If indexes are missing, you'll see an error in the browser console with a link to create the index automatically

## Usage in Your Mobile App

### When User Views a Daily Tip
```javascript
// Call this when user opens/views a daily tip
await logDailyTipView('tip_motivation_1');
```

### When User Starts Breathing Exercise
```javascript
// Call this when breathing exercise starts
await logBreathingExerciseStarted();
```

### When User Completes Breathing Exercise
```javascript
// Call this when breathing exercise completes
const durationInSeconds = 120; // 2 minutes
await logBreathingExerciseCompleted(durationInSeconds);
```

## Firestore Security Rules

Add these rules to your `firestore.rules` file:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Analytics collections - users can only write their own data
    match /analytics_daily_tips/{document} {
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null;
    }

    match /analytics_breathing_exercises/{document} {
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null;
    }
  }
}
```

## Testing

1. **Test in your mobile app:**
   - View a daily tip and check Firestore console
   - Start and complete a breathing exercise
   - Verify documents are created in Firestore

2. **Test in Admin Dashboard:**
   - Open a user's details modal
   - Click on "Daily Coping Tools Analytics"
   - Verify the analytics data displays correctly

## Troubleshooting

**Error: "The query requires an index"**
- Solution: Click the link in the error message or manually create the index as described above

**No data showing in Admin Dashboard**
- Ensure your mobile app is logging events to Firestore
- Check if documents exist in `analytics_daily_tips` and `analytics_breathing_exercises` collections
- Verify the userId in Firestore matches the user's UID in the users collection

**Permission denied errors**
- Verify your Firestore security rules allow read/write access
- Ensure the user is authenticated before logging events
