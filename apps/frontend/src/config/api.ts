/**
 * API Configuration
 * Backend API base URL
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vecarebe.rcht.dev';

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Campaign endpoints
  campaigns: `${API_BASE_URL}/campaigns`,
  verifyDocuments: `${API_BASE_URL}/verify-documents`,
  
  // Creator endpoints
  creators: (address: string) => `${API_BASE_URL}/creators/${address}`,
  
  // Donation endpoints
  donation: (campaignId: number, donorAddress: string) => 
    `${API_BASE_URL}/campaigns/${campaignId}/donations/${donorAddress}`,
  
  // Campaign specific endpoints
  campaign: (id: number) => `${API_BASE_URL}/campaigns/${id}`,
  goalReached: (id: number) => `${API_BASE_URL}/campaigns/${id}/goal-reached`,
  updates: (id: number) => `${API_BASE_URL}/campaigns/${id}/updates`,
  
  // Active campaigns
  activeVerified: `${API_BASE_URL}/campaigns/active/verified`,
};
