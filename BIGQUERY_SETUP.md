# BigQuery Analytics Setup Guide

## Complete setup guide for Firebase Analytics with BigQuery integration

---

## Prerequisites

- Firebase project with Analytics enabled
- Google Cloud Project with billing enabled
- Firebase CLI installed (`npm install -g firebase-tools`)
- Admin access to Firebase and Google Cloud Console

---

## Step 1: Enable BigQuery Export in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **MySunlight** project
3. Navigate to **Analytics** → **Settings** (gear icon)
4. Click on **BigQuery Linking**
5. Click **Link** button
6. Select or create a BigQuery dataset
   - Dataset name: `analytics_XXXXX` (Firebase auto-generates this)
   - Location: Choose your region (e.g., US, EU)
7. Check **"Include advertising identifiers"** (optional)
8. Click **Next** and **Link**

⏱️ **Note**: It takes up to 24 hours for the first data export to appear in BigQuery.

---

## Step 2: Find Your BigQuery Dataset ID

1. Go to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. In the Explorer panel, find your project
3. Look for a dataset named `analytics_XXXXX` (e.g., `analytics_123456789`)
4. Copy the dataset ID (the part after `analytics_`)

---

## Step 3: Initialize Firebase Functions

In your project root directory:

```bash
# Login to Firebase
firebase login

# Initialize Functions (if not already done)
firebase init functions

# When prompted:
# - Choose TypeScript
# - Use ESLint: Yes
# - Install dependencies: Yes
```

---

## Step 4: Install Cloud Function Dependencies

```bash
cd functions
npm install @google-cloud/bigquery firebase-admin firebase-functions
npm install --save-dev @types/node typescript
```

---

## Step 5: Update Cloud Function with Your Dataset ID

Edit `functions/src/index.ts` and replace the placeholder:

```typescript
// Line 47: Replace with your actual dataset ID
const datasetId = 'analytics_123456789'; // ← Your actual dataset ID here
```

To find your dataset ID:
- Go to BigQuery Console
- The full path looks like: `your-project.analytics_123456789.events_*`
- Copy the `analytics_123456789` part

---

## Step 6: Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:getCopingToolsAnalytics
```

Expected output:
```
✔ Deploy complete!
Functions URL: https://us-central1-your-project.cloudfunctions.net/getCopingToolsAnalytics
```

---

## Step 7: Log Analytics Events in Your Mobile/Web App

In your mobile app (Flutter) or web app, log events:

### Daily Tip Viewed

```dart
// Flutter
FirebaseAnalytics.instance.logEvent(
  name: 'Daily_Tip_Viewed',
  parameters: {
    'user_id': userId,
    'tip_id': 'tip_001',
  },
);
```

```typescript
// Web
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

logEvent(analytics, 'Daily_Tip_Viewed', {
  user_id: userId,
  tip_id: 'tip_001',
});
```

### Breathing Exercise Started

```dart
// Flutter
FirebaseAnalytics.instance.logEvent(
  name: 'Breathing_Exercise_Started',
  parameters: {
    'user_id': userId,
  },
);
```

```typescript
// Web
logEvent(analytics, 'Breathing_Exercise_Started', {
  user_id: userId,
});
```

### Breathing Exercise Completed

```dart
// Flutter
FirebaseAnalytics.instance.logEvent(
  name: 'Breathing_Exercise_Completed',
  parameters: {
    'user_id': userId,
    'duration': 180, // seconds
  },
);
```

```typescript
// Web
logEvent(analytics, 'Breathing_Exercise_Completed', {
  user_id: userId,
  duration: 180, // seconds
});
```

---

## Step 8: Test the Setup

### Verify Events in Firebase Console

1. Go to Firebase Console → **Analytics** → **Events**
2. Wait 24-48 hours for events to appear
3. Check for:
   - `Daily_Tip_Viewed`
   - `Breathing_Exercise_Started`
   - `Breathing_Exercise_Completed`

### Query BigQuery Directly

1. Go to [BigQuery Console](https://console.cloud.google.com/bigquery)
2. Click **Compose New Query**
3. Run this test query:

```sql
SELECT
  event_name,
  COUNT(*) as event_count
FROM
  `your-project-id.analytics_123456789.events_*`
WHERE
  event_name IN ('Daily_Tip_Viewed', 'Breathing_Exercise_Started', 'Breathing_Exercise_Completed')
  AND _TABLE_SUFFIX = FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY event_name
ORDER BY event_count DESC
```

### Test Cloud Function

```bash
# Test locally with Firebase Emulator
firebase emulators:start --only functions

# Or test deployed function
firebase functions:config:get
```

---

## Step 9: Grant BigQuery Permissions

The Cloud Function needs permission to query BigQuery:

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find service account: `your-project@appspot.gserviceaccount.com`
3. Click **Edit** (pencil icon)
4. Add role: **BigQuery Data Viewer**
5. Add role: **BigQuery Job User**
6. Click **Save**

---

## Step 10: Test in Admin Dashboard

1. Open your admin dashboard: http://localhost:5173
2. Navigate to **Users** page
3. Click **View Details** on any user
4. Scroll to **Daily Coping Tools** section
5. Check browser console for logs

Expected console output:
```
Fetching coping tools analytics for user: userId123
Coping tools stats from BigQuery: { totalTipsViewed: 5, ... }
```

---

## Troubleshooting

### Problem: "Cloud Function not found"

**Solution**: Deploy the function first
```bash
firebase deploy --only functions
```

### Problem: "BigQuery table not found"

**Solution**:
- Wait 24 hours for first data export
- Verify BigQuery linking in Firebase Console
- Check that analytics events are being logged

### Problem: "Permission denied on BigQuery"

**Solution**:
- Grant BigQuery permissions (Step 9)
- Redeploy functions after granting permissions

### Problem: "No data in admin dashboard"

**Solutions**:
1. Verify events are logged in Firebase Console → Analytics → Events
2. Check BigQuery Console for `events_*` tables
3. Verify dataset ID in Cloud Function matches your actual dataset
4. Check browser console for error messages
5. Ensure user has logged some analytics events

### Problem: "Function timeout"

**Solution**: Increase timeout in `functions/src/index.ts`:
```typescript
export const getCopingToolsAnalytics = functions
  .runWith({ timeoutSeconds: 300 }) // 5 minutes
  .https.onCall(async (data, context) => {
    // ...
  });
```

---

## Cost Considerations

### BigQuery Costs
- **Storage**: $0.02 per GB per month (first 10 GB free)
- **Queries**: $5 per TB processed (first 1 TB free per month)
- **Typical cost**: $5-20/month for moderate usage

### Firebase Analytics
- **Free**: Unlimited events and users

### Cloud Functions
- **Free tier**: 2M invocations/month
- **Paid**: $0.40 per million invocations

**Estimated total**: $5-30/month depending on usage

---

## Data Schema

### BigQuery Event Schema

Events are stored in tables like: `events_20250126`

```
events_YYYYMMDD
├── event_timestamp: INTEGER (microseconds)
├── event_name: STRING
├── user_pseudo_id: STRING
├── event_params: ARRAY<STRUCT>
│   ├── key: STRING
│   └── value: STRUCT
│       ├── string_value: STRING
│       ├── int_value: INTEGER
│       └── float_value: FLOAT
└── (other fields...)
```

### Example Event Data

```json
{
  "event_timestamp": "1706284800000000",
  "event_name": "Daily_Tip_Viewed",
  "user_pseudo_id": "user123",
  "event_params": [
    {
      "key": "user_id",
      "value": { "string_value": "userId123" }
    },
    {
      "key": "tip_id",
      "value": { "string_value": "tip_001" }
    }
  ]
}
```

---

## Maintenance

### Daily Tasks
- ✅ Monitor Cloud Function logs
- ✅ Check for errors in Firebase Console

### Weekly Tasks
- ✅ Review BigQuery costs
- ✅ Check analytics data quality

### Monthly Tasks
- ✅ Archive old analytics data (optional)
- ✅ Review and optimize queries

---

## Security Best Practices

1. **Never expose BigQuery credentials** in client-side code
2. **Use Cloud Functions** as a secure proxy to BigQuery
3. **Validate user authentication** in Cloud Functions
4. **Implement admin-only access** for analytics endpoints
5. **Set up billing alerts** in Google Cloud Console

---

## Additional Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Firebase to BigQuery Export](https://support.google.com/firebase/answer/9268042)
- [BigQuery Pricing](https://cloud.google.com/bigquery/pricing)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)

---

## Quick Reference

| Task | Command |
|------|---------|
| Deploy functions | `firebase deploy --only functions` |
| View function logs | `firebase functions:log` |
| Test locally | `firebase emulators:start` |
| Query BigQuery | `bq query "SELECT ..."` |
| Check costs | [Google Cloud Console → Billing](https://console.cloud.google.com/billing) |

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Cloud Function logs: `firebase functions:log`
3. Check BigQuery job history in BigQuery Console
4. Verify Firebase Analytics events in Firebase Console
