import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface JournalPrompt {
  prompt: string;
  type: string;
}

interface JournalEntry {
  createdAt: any;
  image_url?: string;
  pinned_prompt_index?: number;
  prompts?: JournalPrompt[];
}

export interface PromptUsage {
  prompt: string;
  count: number;
  type: string;
}

export interface JournalingStats {
  entriesCount: number;
  averageWordCount: number;
  frequency: string;
  lastEntryDate: string;
  promptUsage: PromptUsage[];
}

interface JournalingState {
  stats: JournalingStats;
  loading: boolean;
  error: string | null;
}

const initialState: JournalingState = {
  stats: {
    entriesCount: 0,
    averageWordCount: 0,
    frequency: 'N/A',
    lastEntryDate: 'N/A',
    promptUsage: [],
  },
  loading: false,
  error: null,
};

// Async thunk to fetch journaling analytics
export const fetchJournalingAnalytics = createAsyncThunk(
  'journaling/fetchAnalytics',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Fetch journal entries from users/{userId}/journal_entries subcollection
      const journalRef = collection(db, 'users', userId, 'journal_entries');
      const journalSnapshot = await getDocs(journalRef);

      console.log(`Fetching journal entries for user: ${userId}`);
      console.log(`Found ${journalSnapshot.size} journal entries`);

      const entries: JournalEntry[] = [];
      const promptsMap = new Map<string, { count: number; type: string }>();
      let totalWords = 0;
      let entriesWithText = 0;
      const entryDates: Date[] = [];

      journalSnapshot.forEach((doc) => {
        const data = doc.data() as JournalEntry;
        console.log('Journal entry data:', doc.id, data);
        entries.push(data);

        // Track entry date
        if (data.createdAt) {
          try {
            const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            entryDates.push(date);
          } catch (err) {
            console.error('Error parsing date:', err);
          }
        }

        // Get the pinned prompt based on pinned_prompt_index
        let pinnedPrompt: JournalPrompt | null = null;
        if (data.prompts && Array.isArray(data.prompts) && data.pinned_prompt_index !== undefined) {
          pinnedPrompt = data.prompts[data.pinned_prompt_index] || null;
        }

        // Count prompt usage and word count (only for pinned prompts)
        if (pinnedPrompt && pinnedPrompt.prompt) {
          // Track prompt usage
          const existing = promptsMap.get(pinnedPrompt.prompt);
          if (existing) {
            existing.count++;
          } else {
            promptsMap.set(pinnedPrompt.prompt, {
              count: 1,
              type: pinnedPrompt.type || 'Unknown',
            });
          }

          // Calculate word count from prompt text
          const wordCount = pinnedPrompt.prompt.split(/\s+/).filter((word) => word.length > 0).length;
          if (wordCount > 0) {
            totalWords += wordCount;
            entriesWithText++;
          }
        }
      });

      // Calculate average word count
      const averageWordCount = entriesWithText > 0 ? Math.round(totalWords / entriesWithText) : 0;

      // Calculate frequency
      let frequency = 'N/A';
      let lastEntryDate = 'N/A';

      if (entryDates.length > 1) {
        entryDates.sort((a, b) => a.getTime() - b.getTime());
        const firstDate = entryDates[0];
        const lastDate = entryDates[entryDates.length - 1];
        const daysDiff = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
          const entriesPerDay = entries.length / daysDiff;

          if (entriesPerDay >= 0.8) {
            frequency = 'Daily';
          } else if (entriesPerDay >= 0.3) {
            frequency = 'Several times per week';
          } else if (entriesPerDay >= 0.14) {
            frequency = 'Weekly';
          } else if (entriesPerDay >= 0.06) {
            frequency = 'Bi-weekly';
          } else {
            frequency = 'Monthly or less';
          }
        }

        lastEntryDate = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(lastDate);
      } else if (entryDates.length === 1) {
        frequency = 'One entry only';
        lastEntryDate = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(entryDates[0]);
      }

      // Convert prompts map to array and sort by count (top 5)
      const promptUsage = Array.from(promptsMap.entries())
        .map(([prompt, data]) => ({
          prompt,
          count: data.count,
          type: data.type,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const stats: JournalingStats = {
        entriesCount: entries.length,
        averageWordCount,
        frequency,
        lastEntryDate,
        promptUsage,
      };

      console.log('Calculated stats:', stats);

      return stats;
    } catch (error: any) {
      console.error('Error fetching journaling analytics:', error);
      return rejectWithValue(error.message || 'Failed to fetch journaling analytics');
    }
  }
);

const journalingSlice = createSlice({
  name: 'journaling',
  initialState,
  reducers: {
    clearJournalingStats: (state) => {
      state.stats = initialState.stats;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalingAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalingAnalytics.fulfilled, (state, action: PayloadAction<JournalingStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchJournalingAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearJournalingStats, clearError } = journalingSlice.actions;
export default journalingSlice.reducer;
