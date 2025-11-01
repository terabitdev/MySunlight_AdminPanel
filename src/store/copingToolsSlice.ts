import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

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

export interface CopingToolsStats {
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

interface CopingToolsState {
  stats: CopingToolsStats;
  loading: boolean;
  error: string | null;
}

const initialState: CopingToolsState = {
  stats: {
    totalTipsViewed: 0,
    uniqueTipsViewed: 0,
    breathingExercisesStarted: 0,
    breathingExercisesCompleted: 0,
    averageExerciseDuration: 0,
    completionRate: 0,
    recentTipViews: [],
    recentBreathingExercises: [],
    mostViewedTips: [],
  },
  loading: false,
  error: null,
};

// Async thunk to fetch coping tools analytics from Firestore
export const fetchCopingToolsAnalytics = createAsyncThunk(
  'copingTools/fetchAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      // 1. Fetch daily tip views
      const tipViewsRef = collection(db, 'analytics_daily_tips');
      const tipViewsQuery = query(
        tipViewsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const tipViewsSnapshot = await getDocs(tipViewsQuery);
      const recentTipViews: DailyTipView[] = [];
      const tipCountMap = new Map<string, number>();

      tipViewsSnapshot.forEach((doc) => {
        const data = doc.data();
        const tipView: DailyTipView = {
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
          tipId: data.tipId || '',
          userId: data.userId || userId,
        };

        recentTipViews.push(tipView);

        // Count tip views
        const currentCount = tipCountMap.get(data.tipId) || 0;
        tipCountMap.set(data.tipId, currentCount + 1);
      });

      const totalTipsViewed = recentTipViews.length;
      const uniqueTipsViewed = tipCountMap.size;

      // Get most viewed tips
      const mostViewedTips = Array.from(tipCountMap.entries())
        .map(([tipId, count]) => ({ tipId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 2. Fetch breathing exercises
      const breathingExercisesRef = collection(db, 'analytics_breathing_exercises');
      const breathingQuery = query(
        breathingExercisesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const breathingSnapshot = await getDocs(breathingQuery);
      const recentBreathingExercises: BreathingExercise[] = [];
      let breathingExercisesStarted = 0;
      let breathingExercisesCompleted = 0;
      let totalDuration = 0;
      let durationCount = 0;

      breathingSnapshot.forEach((doc) => {
        const data = doc.data();
        const exercise: BreathingExercise = {
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
          userId: data.userId || userId,
          duration: data.duration,
          status: data.status || 'started',
        };

        recentBreathingExercises.push(exercise);

        if (exercise.status === 'started') {
          breathingExercisesStarted++;
        } else if (exercise.status === 'completed') {
          breathingExercisesCompleted++;
          if (exercise.duration) {
            totalDuration += exercise.duration;
            durationCount++;
          }
        }
      });

      const averageExerciseDuration = durationCount > 0 ? totalDuration / durationCount : 0;
      const completionRate = breathingExercisesStarted > 0
        ? (breathingExercisesCompleted / breathingExercisesStarted) * 100
        : 0;

      const stats: CopingToolsStats = {
        totalTipsViewed,
        uniqueTipsViewed,
        breathingExercisesStarted,
        breathingExercisesCompleted,
        averageExerciseDuration,
        completionRate,
        recentTipViews: recentTipViews.slice(0, 10),
        recentBreathingExercises: recentBreathingExercises.slice(0, 10),
        mostViewedTips,
      };

      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coping tools analytics');
    }
  }
);

const copingToolsSlice = createSlice({
  name: 'copingTools',
  initialState,
  reducers: {
    clearCopingToolsStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCopingToolsAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCopingToolsAnalytics.fulfilled, (state, action: PayloadAction<CopingToolsStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCopingToolsAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCopingToolsStats, clearError } = copingToolsSlice.actions;
export default copingToolsSlice.reducer;
