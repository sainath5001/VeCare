export interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  medicalDocumentHash: string;
  goalAmount: string;
  raisedAmount: string;
  deadline: number;
  isActive: boolean;
  isVerified: boolean;
  fundsWithdrawn: boolean;
  createdAt: number;
  donorCount: number;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  medicalDocuments: string[];
  goalAmount: string;
  durationDays: number;
  creatorAddress: string;
}

export interface CampaignVerificationResult {
  campaignId: number;
  isVerified: boolean;
  verificationDetails: {
    confidenceScore: number;
    documentType: string;
    findings: string[];
    reasoning: string;
    redFlags: string[];
  };
}

export interface CreatorProfile {
  totalCampaigns: number;
  successfulCampaigns: number;
  totalRaised: string;
  trustScore: number;
  lastUpdateTimestamp: number;
  exists: boolean;
}
