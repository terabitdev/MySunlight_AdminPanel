import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getFunctions, httpsCallable } from 'firebase/functions';

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

// Async thunk to fetch coping tools analytics from Cloud Function
export const fetchCopingToolsAnalytics = createAsyncThunk(
  'copingTools/fetchAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log(`Fetching coping tools analytics for user: ${userId}`);

      // Call Cloud Function that queries BigQuery
      const functions = getFunctions();
      const getCopingToolsAnalytics = httpsCallable<
        { userId: string },
        CopingToolsStats
      >(functions, 'getCopingToolsAnalytics');

      const result = await getCopingToolsAnalytics({ userId });

      console.log('Coping tools stats from BigQuery:', result.data);

      return result.data;
    } catch (error: any) {
      console.error('Error fetching coping tools analytics:', error);

      // Return empty stats if Cloud Function is not deployed or BigQuery is not set up
      if (error.code === 'not-found' || error.code === 'failed-precondition') {
        console.warn('Cloud Function not found. Returning empty stats.');
        return {
          totalTipsViewed: 0,
          uniqueTipsViewed: 0,
          breathingExercisesStarted: 0,
          breathingExercisesCompleted: 0,
          averageExerciseDuration: 0,
          completionRate: 0,
          recentTipViews: [],
          recentBreathingExercises: [],
          mostViewedTips: [],
        };
      }

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
