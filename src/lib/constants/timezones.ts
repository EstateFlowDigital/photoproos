/**
 * Comprehensive timezone options for user preferences
 *
 * Organized by region with common timezones first.
 */

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // North America
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5/-4" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6/-5" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7/-6" },
  { value: "America/Phoenix", label: "Arizona (MST)", offset: "UTC-7" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8/-7" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9/-8" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: "UTC-10" },

  // Canada
  { value: "America/Toronto", label: "Toronto (ET)", offset: "UTC-5/-4" },
  { value: "America/Vancouver", label: "Vancouver (PT)", offset: "UTC-8/-7" },
  { value: "America/Edmonton", label: "Edmonton (MT)", offset: "UTC-7/-6" },
  { value: "America/Halifax", label: "Halifax (AT)", offset: "UTC-4/-3" },
  { value: "America/St_Johns", label: "St. John's (NT)", offset: "UTC-3:30/-2:30" },

  // Europe
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/+1" },
  { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Rome", label: "Rome (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Madrid", label: "Madrid (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Zurich", label: "Zurich (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Stockholm", label: "Stockholm (CET)", offset: "UTC+1/+2" },
  { value: "Europe/Athens", label: "Athens (EET)", offset: "UTC+2/+3" },
  { value: "Europe/Helsinki", label: "Helsinki (EET)", offset: "UTC+2/+3" },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: "UTC+3" },

  // Asia Pacific
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)", offset: "UTC+5:30" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "UTC+8" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Asia/Seoul", label: "Seoul (KST)", offset: "UTC+9" },

  // Australia & New Zealand
  { value: "Australia/Perth", label: "Perth (AWST)", offset: "UTC+8" },
  { value: "Australia/Adelaide", label: "Adelaide (ACST)", offset: "UTC+9:30/+10:30" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", offset: "UTC+10/+11" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST)", offset: "UTC+10/+11" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)", offset: "UTC+10" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)", offset: "UTC+12/+13" },

  // South America
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", offset: "UTC-3" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)", offset: "UTC-3" },
  { value: "America/Santiago", label: "Santiago (CLT)", offset: "UTC-4/-3" },
  { value: "America/Bogota", label: "Bogotá (COT)", offset: "UTC-5" },
  { value: "America/Lima", label: "Lima (PET)", offset: "UTC-5" },
  { value: "America/Mexico_City", label: "Mexico City (CST)", offset: "UTC-6/-5" },

  // Middle East & Africa
  { value: "Africa/Cairo", label: "Cairo (EET)", offset: "UTC+2" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)", offset: "UTC+2" },
  { value: "Africa/Lagos", label: "Lagos (WAT)", offset: "UTC+1" },
  { value: "Asia/Jerusalem", label: "Jerusalem (IST)", offset: "UTC+2/+3" },
  { value: "Asia/Riyadh", label: "Riyadh (AST)", offset: "UTC+3" },
];

/**
 * Get timezones grouped by region for better UI organization
 */
export const TIMEZONE_GROUPS = {
  "North America": TIMEZONE_OPTIONS.filter(
    (tz) => tz.value.startsWith("America/") && !tz.value.includes("Sao_Paulo") && !tz.value.includes("Buenos") && !tz.value.includes("Santiago") && !tz.value.includes("Bogota") && !tz.value.includes("Lima") && !tz.value.includes("Mexico")
  ).slice(0, 7),
  "Canada": TIMEZONE_OPTIONS.filter((tz) =>
    ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Halifax", "America/St_Johns"].includes(tz.value)
  ),
  "Europe": TIMEZONE_OPTIONS.filter((tz) => tz.value.startsWith("Europe/")),
  "Asia Pacific": TIMEZONE_OPTIONS.filter((tz) => tz.value.startsWith("Asia/")),
  "Australia & NZ": TIMEZONE_OPTIONS.filter(
    (tz) => tz.value.startsWith("Australia/") || tz.value.startsWith("Pacific/")
  ),
  "South America": TIMEZONE_OPTIONS.filter((tz) =>
    ["America/Sao_Paulo", "America/Buenos_Aires", "America/Santiago", "America/Bogota", "America/Lima", "America/Mexico_City"].includes(tz.value)
  ),
  "Middle East & Africa": TIMEZONE_OPTIONS.filter(
    (tz) => tz.value.startsWith("Africa/") || ["Asia/Jerusalem", "Asia/Riyadh", "Asia/Dubai"].includes(tz.value)
  ),
};
