import type { PlacementPreferences } from '../schedule/session-placement.js';

// Used until saved study preferences are wired in. Sessions are up to the 60 minute session
// length but can be as short as 30, so leftover work (like the last 30 minutes) still fits.
export const DEFAULT_STUDY_LIMITS: PlacementPreferences = {
  minSessionMinutes: 30,
  maxSessionMinutes: 60,
  maxStudyMinutesPerDay: 240,
  breakMinutes: 10,
};
