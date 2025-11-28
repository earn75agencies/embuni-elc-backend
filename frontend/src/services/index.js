/**
 * Services Index
 * Central export point for all API services
 */

// Auth and User Management
export { default as authService } from './authService';
export { default as adminService } from './adminService';
export { default as memberService } from './memberService';

// Content Management
export { default as postService } from './postService';
export { default as eventService } from './eventService';
export { default as galleryService } from './galleryService';
export { default as partnerService } from './partnerService';
export { default as testimonialService } from './testimonialService';

// Election and Voting
export { default as electionService } from './electionService';
export { default as voteService } from './voteService';
export { default as candidateService } from './candidateService';
export { default as votingLinkService } from './votingLinkService';
export { default as positionService } from './positionService';

// Contact and Communication
export { default as contactService } from './contactService';
export { default as contactMessageService } from './contactMessageService';

// System and Configuration
export { default as designSettingsService } from './designSettingsService';
export { default as analyticsService } from './analyticsService';
export { default as recaptchaService } from './recaptchaService';
export { default as adminCredentialService } from './adminCredentialService';

// Core API client
export { default as apiClient } from './apiClient';
