/**
 * Timezone utilities for internationalization
 */

// Get user's timezone
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC';
  }
};

// Get timezone offset in minutes
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

// Get timezone abbreviation (e.g., EST, PST)
export const getTimezoneAbbreviation = (timezone = null) => {
  try {
    const tz = timezone || getUserTimezone();
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const tzName = parts.find(part => part.type === 'timeZoneName');
    return tzName ? tzName.value : 'UTC';
  } catch (error) {
    return 'UTC';
  }
};

// Store user timezone preference
export const setUserTimezone = (timezone) => {
  try {
    localStorage.setItem('userTimezone', timezone);
  } catch (error) {
    console.error('Failed to save timezone preference:', error);
  }
};

// Get stored user timezone preference
export const getStoredTimezone = () => {
  try {
    return localStorage.getItem('userTimezone') || getUserTimezone();
  } catch (error) {
    return getUserTimezone();
  }
};

// Initialize timezone on app load
export const initializeTimezone = () => {
  const stored = getStoredTimezone();
  if (!stored || stored === 'UTC') {
    const detected = getUserTimezone();
    setUserTimezone(detected);
    return detected;
  }
  return stored;
};

// Common timezones for selection
export const commonTimezones = [
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', offset: '+03:00' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (EAT)', offset: '+03:00' },
  { value: 'Africa/Kampala', label: 'Kampala (EAT)', offset: '+03:00' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', offset: '+01:00' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: '+02:00' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', offset: '+02:00' },
  { value: 'Europe/London', label: 'London (GMT)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: '+01:00' },
  { value: 'America/New_York', label: 'New York (EST)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: '-08:00' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: '+04:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: '+09:00' },
  { value: 'UTC', label: 'UTC', offset: '+00:00' }
];

// Get timezone by value
export const getTimezoneByValue = (value) => {
  return commonTimezones.find(tz => tz.value === value) || commonTimezones[commonTimezones.length - 1];
};

