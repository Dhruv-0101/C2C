/**
 * 🏢 BRAND IDENTITY & ASSETS CONSTANTS:
 * Central single source of truth for BrandKit validation limits, default presets, and language choices.
 */

export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_CAPTION_LANGUAGE = 'English';

export const ALLOWED_CAPTION_LANGUAGES = Object.freeze([
  'English',
  'Hindi',
  'Hinglish',
  'Gujarati',
  'Marathi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Punjabi',
]);

// Field Length & Content Validation Limits
export const BRANDKIT_LIMITS = Object.freeze({
  BUSINESS_NAME_MIN_LENGTH: 2,
  BUSINESS_NAME_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  WHATSAPP_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
  TAGLINE_MAX_LENGTH: 200,
  ADDRESS_MAX_LENGTH: 300,
  CITY_MAX_LENGTH: 100,
  STATE_MAX_LENGTH: 100,
  COUNTRY_MAX_LENGTH: 100,
  TARGET_AUDIENCE_MAX_LENGTH: 500,
  BUSINESS_USPS_MAX_LENGTH: 1000,
  WORKING_HOURS_MAX_LENGTH: 100,
  UPI_VPA_MAX_LENGTH: 100,
  INSTAGRAM_HANDLE_MAX_LENGTH: 100,
  FACEBOOK_HANDLE_MAX_LENGTH: 150,
  LINKEDIN_HANDLE_MAX_LENGTH: 150,
  GMB_REVIEW_URL_MAX_LENGTH: 500,
});

// Default Mock / Placeholder Fallback for New Users who have not yet configured a BrandKit
export const DEFAULT_BRAND_KIT_FALLBACK = Object.freeze({
  businessName: 'Sunrise Real Estate',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'Business Park, MG Road, Mumbai',
  tagline: 'Premium Luxury Homes & Commercial Spaces',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  captionLanguage: 'English',
});

// Keys synchronized between BrandKit profile and generated post graphics/configs
export const BRAND_SYNC_KEYS = Object.freeze([
  'businessName',
  'logoUrl',
  'phone',
  'whatsapp',
  'email',
  'website',
  'address',
  'tagline',
  'primaryColor',
  'secondaryColor',
  'instagramHandle',
  'facebookHandle',
  'linkedinHandle',
  'upiVpa',
  'qrCodeUrl',
  'customFields',
  'city',
  'state',
]);
