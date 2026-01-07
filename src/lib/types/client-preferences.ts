export interface ClientBookingProfilePreferences {
  birthDate?: string;
  thankYouPreference?: string;
  giftPreferenceNotes?: string;
}

export interface ClientBookingAgreementPreferences {
  policyAcceptedAt?: string;
  policyVersion?: string;
  checklistAcceptedAt?: string;
}

export interface ClientBookingPreferences {
  profile?: ClientBookingProfilePreferences;
  preferences?: Record<string, string>;
  agreements?: ClientBookingAgreementPreferences;
  preferredIndustry?: string;
}

export interface ClientPreferences {
  booking?: ClientBookingPreferences;
}
