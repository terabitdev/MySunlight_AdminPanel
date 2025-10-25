/**
 * Firebase Cloud Functions for Analytics Data
 *
 * Setup Instructions:
 * 1. Enable BigQuery Export in Firebase Console
 * 2. Install dependencies: npm install @google-cloud/bigquery
 * 3. Deploy: firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import { BigQuery } from '@google-cloud/bigquery';

interface DailyTipView {
  timestamp: string;
  tipId: string;
  userId: string;
}

interface BreathingExercise {
  timestamp: string;
  userId: string;
  duration?: number;
  status: 'started' | 'completed';
}

interface CopingToolsStats {
  totalTipsViewed: number;
  uniqueTipsViewed: number;
  breathingExercisesStarted: number;
  breathingExercisesCompleted: number;
  averageExerciseDuration: number;
  completionRate: number;
  recentTipViews: DailyTipView[];
  recentBreathingExercises: BreathingExercise[];
  mostViewedTips: { tipId: string; count: number }[];
}

/**
 * Cloud Function to fetch coping tools analytics from BigQuery
 */
export const getCopingToolsAnalytics = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to access analytics'
      );
    }

    // Verify admin access (optional - add your admin check logic)
    // const adminCheck = await admin.firestore()
    //   .collection('users')
    //   .doc(context.auth.uid)
    //   .get();
    // if (adminCheck.data()?.type !== 'Admin') {
    //   throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    // }

    const userId = data.userId;

    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'userId is required');
    }

    try {
      const bigquery = new BigQuery();

      // Replace 'your-project-id' and 'analytics_XXXXX' with your actual values
      // You can find these in Firebase Console -> Project Settings -> General
      const projectId = process.env.GCLOUD_PROJECT || 'your-project-id';
      const datasetId = 'analytics_XXXXX'; // Replace with your actual dataset ID

      // Query for the last 30 days of analytics data
      const query = `
        SELECT
          event_name,
          TIMESTAMP_MICROS(event_timestamp) as event_timestamp,
          user_pseudo_id,
          (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'tip_id') as tip_id,
          (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'duration') as duration
        FROM
          \`${projectId}.${datasetId}.events_*\`
        WHERE
          user_pseudo_id = @userId
          AND event_name IN ('Daily_Tip_Viewed', 'Breathing_Exercise_Started', 'Breathing_Exercise_Completed')
          AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
          AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
        ORDER BY event_timestamp DESC
        LIMIT 1000
      `;

      const options = {
        query: query,
        params: { userId: userId },
      };

      const [rows] = await bigquery.query(options);

      // Process the data
      const tipViews: DailyTipView[] = [];
      const tipCounts = new Map<string, number>();
      const breathingExercises: BreathingExercise[] = [];
      let breathingStarted = 0;
      let breathingCompleted = 0;
      let totalDuration = 0;

      rows.forEach((row: any) => {
        const timestamp = row.event_timestamp.value;

        switch (row.event_name) {
          case 'Daily_Tip_Viewed':
            if (row.tip_id) {
              tipViews.push({
                timestamp: timestamp,
                tipId: row.tip_id,
                userId: row.user_pseudo_id,
              });

              const count = tipCounts.get(row.tip_id) || 0;
              tipCounts.set(row.tip_id, count + 1);
            }
            break;

          case 'Breathing_Exercise_Started':
            breathingStarted++;
            breathingExercises.push({
              timestamp: timestamp,
              userId: row.user_pseudo_id,
              status: 'started',
            });
            break;

          case 'Breathing_Exercise_Completed':
            breathingCompleted++;
            const duration = row.duration || 0;
            breathingExercises.push({
              timestamp: timestamp,
              userId: row.user_pseudo_id,
              duration: duration,
              status: 'completed',
            });
            if (duration > 0) {
              totalDuration += duration;
            }
            break;
        }
      });

      // Calculate stats
      const stats: CopingToolsStats = {
        totalTipsViewed: tipViews.length,
        uniqueTipsViewed: tipCounts.size,
        breathingExercisesStarted: breathingStarted,
        breathingExercisesCompleted: breathingCompleted,
        averageExerciseDuration:
          breathingCompleted > 0 ? Math.round(totalDuration / breathingCompleted) : 0,
        completionRate:
          breathingStarted > 0 ? Math.round((breathingCompleted / breathingStarted) * 100) : 0,
        recentTipViews: tipViews.slice(0, 10),
        recentBreathingExercises: breathingExercises
          .filter((ex) => ex.status === 'completed')
          .slice(0, 10),
        mostViewedTips: Array.from(tipCounts.entries())
          .map(([tipId, count]) => ({ tipId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      };

      return stats;
    } catch (error: any) {
      console.error('Error fetching analytics from BigQuery:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch analytics data',
        error.message
      );
    }
  }
);

/**
 * Alternative: Query Firebase Analytics using Google Analytics Data API
 * This requires enabling Google Analytics Data API in Google Cloud Console
 */
export const getCopingToolsAnalyticsGA = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = data.userId;

    try {
      // Note: This requires @google-analytics/data package
      // const { BetaAnalyticsDataClient } = require('@google-analytics/data');
      // const analyticsDataClient = new BetaAnalyticsDataClient();

      // const [response] = await analyticsDataClient.runReport({
      //   property: `properties/YOUR_PROPERTY_ID`,
      //   dateRanges: [
      //     {
      //       startDate: '30daysAgo',
      //       endDate: 'today',
      //     },
      //   ],
      //   dimensions: [
      //     { name: 'eventName' },
      //     { name: 'customUser:user_id' },
      //   ],
      //   metrics: [{ name: 'eventCount' }],
      //   dimensionFilter: {
      //     filter: {
      //       fieldName: 'customUser:user_id',
      //       stringFilter: {
      //         value: userId,
      //       },
      //     },
      //   },
      // });

      // Process response and return stats
      return { message: 'Google Analytics Data API implementation needed' };
    } catch (error: any) {
      console.error('Error fetching analytics from GA Data API:', error);
      throw new functions.https.HttpsError('internal', 'Failed to fetch analytics');
    }
  }
);
