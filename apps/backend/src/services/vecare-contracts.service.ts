import { HttpException } from '@/exceptions/HttpException';
import { veCareContract } from '@/utils/thor';
import { Service } from 'typedi';
import { unitsUtils } from '@vechain/sdk-core';

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

/** Mock campaign for development when RPC returns 0x / decode fails – so GET /campaigns/:id works for mock ids 1–8 */
function getMockCampaignForDev(id: number): Campaign | null {
  const now = Math.floor(Date.now() / 1000);
  const mocks: Record<number, Omit<Campaign, 'id'>> = {
    1: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Medical Fund for Treatment',
      description: 'My name is Sarah and I need help with cancer treatment. The doctors have recommended a course of chemotherapy and surgery. My family cannot afford the full cost. Any support would mean a lot. Thank you for considering my campaign.',
      medicalDocumentHash: '',
      goalAmount: '1000',
      raisedAmount: '320',
      deadline: now + 30 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 5 * 86400,
      donorCount: 8,
    },
    2: {
      creator: '0x0000000000000000000000000000000000000000',
      title: "Child's Heart Surgery",
      description: "Our 5-year-old needs urgent heart surgery. The medical team has given us a window of 3 months. We have already sold our car and need your help to cover the remaining hospital and recovery costs.",
      medicalDocumentHash: '',
      goalAmount: '8000',
      raisedAmount: '3400',
      deadline: now + 45 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 10 * 86400,
      donorCount: 28,
    },
    3: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Rare Disease Medication Fund',
      description: 'Living with a rare disease means expensive monthly medication that insurance does not fully cover. This campaign will help cover one year of treatment so I can keep working and supporting my family.',
      medicalDocumentHash: '',
      goalAmount: '3000',
      raisedAmount: '2100',
      deadline: now + 10 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 20 * 86400,
      donorCount: 45,
    },
    4: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Recovery After Serious Accident',
      description: 'I was in a car accident and need multiple surgeries and months of physiotherapy. My family cannot afford the full cost. Your donation will help me get back on my feet and return to work. Thank you for your kindness.',
      medicalDocumentHash: '',
      goalAmount: '6500',
      raisedAmount: '2800',
      deadline: now + 18 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 12 * 86400,
      donorCount: 34,
    },
    5: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Diabetes Supplies for a Year',
      description: 'Managing type 1 diabetes requires constant supplies: insulin, test strips, and a pump. Insurance covers only part of it. This campaign will fund one year of supplies so I can stay healthy and continue caring for my children.',
      medicalDocumentHash: '',
      goalAmount: '4200',
      raisedAmount: '1900',
      deadline: now + 32 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 8 * 86400,
      donorCount: 22,
    },
    6: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Kidney Transplant Support',
      description: 'After years on dialysis, I have been approved for a kidney transplant. The surgery and aftercare are costly. Your support will help cover medications and follow-up care so I can recover and return to a normal life.',
      medicalDocumentHash: '',
      goalAmount: '7500',
      raisedAmount: '4100',
      deadline: now + 22 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 8 * 86400,
      donorCount: 56,
    },
    7: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Spinal Surgery for Mobility',
      description: 'A spinal condition has left me in constant pain and unable to work. Surgery could restore my mobility. I have saved what I can but still need help with the remaining hospital and rehabilitation expenses.',
      medicalDocumentHash: '',
      goalAmount: '5500',
      raisedAmount: '1800',
      deadline: now + 40 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 5 * 86400,
      donorCount: 19,
    },
    8: {
      creator: '0x0000000000000000000000000000000000000000',
      title: 'Emergency Surgery for Our Father',
      description: "Our father needs urgent surgery to remove a tumour. We are doing everything we can as a family but the bills are overwhelming. Every contribution brings us closer to giving him the care he deserves.",
      medicalDocumentHash: '',
      goalAmount: '9200',
      raisedAmount: '5200',
      deadline: now + 14 * 86400,
      isActive: true,
      isVerified: true,
      fundsWithdrawn: false,
      createdAt: now - 6 * 86400,
      donorCount: 72,
    },
  };
  const base = mocks[id];
  if (!base) return null;
  return { ...base, id };
}

export interface CreatorProfile {
  totalCampaigns: number;
  successfulCampaigns: number;
  totalRaised: string;
  trustScore: number;
  lastUpdateTimestamp: number;
  exists: boolean;
}

@Service()
export class VeCareContractsService {
  /**
   * Create a new medical campaign
   */
  public async createCampaign(
    title: string,
    description: string,
    medicalDocumentHash: string,
    goalAmount: string,
    durationDays: number,
  ): Promise<{ success: boolean; campaignId?: number; txId?: string }> {
    try {
      const goalInWei = unitsUtils.parseUnits(goalAmount, 'ether');

      const result = await (await veCareContract.transact.createCampaign(title, description, medicalDocumentHash, goalInWei, durationDays)).wait();

      if (result.reverted) {
        return { success: false };
      }

      // Extract campaign ID from event topics
      // The CampaignCreated event has the campaign ID as the second topic (topics[1])
      let campaignId: number | undefined;

      if (result.outputs && result.outputs.length > 0) {
        const events = (result.outputs[0] as any).events;
        if (events && events.length > 0) {
          // Find the CampaignCreated event
          const campaignCreatedEvent = events.find((e: any) => e.topics && e.topics.length >= 2);

          if (campaignCreatedEvent && campaignCreatedEvent.topics) {
            // Campaign ID is in topics[1] as a hex string
            const campaignIdHex = campaignCreatedEvent.topics[1];
            campaignId = parseInt(campaignIdHex, 16);
          }
        }
      }

      const txId = (result.meta as any)?.txID || undefined;

      console.log('Campaign created successfully. Campaign ID:', campaignId, 'TX:', txId);

      return {
        success: true,
        campaignId,
        txId,
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new HttpException(500, 'Failed to create campaign on blockchain');
    }
  }

  /**
   * Verify a campaign (admin only)
   */
  public async verifyCampaign(campaignId: number, verified: boolean): Promise<boolean> {
    try {
      const result = await (await veCareContract.transact.verifyCampaign(campaignId, verified)).wait();

      return !result.reverted;
    } catch (error) {
      console.error('Error verifying campaign:', error);
      return false;
    }
  }

  /**
   * Get campaign details
   */
  public async getCampaign(campaignId: number): Promise<Campaign | null> {
    try {
      const result = await veCareContract.read.getCampaign(campaignId);

      if (!result || result.length === 0) {
        if (process.env.NODE_ENV === 'development' && campaignId >= 1 && campaignId <= 8) {
          return getMockCampaignForDev(campaignId);
        }
        return null;
      }

      const campaignData = result[0];

      return {
        id: Number(campaignData.id),
        creator: campaignData.creator,
        title: campaignData.title,
        description: campaignData.description,
        medicalDocumentHash: campaignData.medicalDocumentHash,
        goalAmount: unitsUtils.formatUnits(campaignData.goalAmount, 'ether'),
        raisedAmount: unitsUtils.formatUnits(campaignData.raisedAmount, 'ether'),
        deadline: Number(campaignData.deadline),
        isActive: campaignData.isActive,
        isVerified: campaignData.isVerified,
        fundsWithdrawn: campaignData.fundsWithdrawn,
        createdAt: Number(campaignData.createdAt),
        donorCount: Number(campaignData.donorCount),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development' && campaignId >= 1 && campaignId <= 8) {
        return getMockCampaignForDev(campaignId);
      }
      console.warn('getCampaign failed (RPC 0x?):', (error as Error)?.message ?? error);
      return null;
    }
  }

  /**
   * Get all campaigns (paginated)
   */
  public async getAllCampaigns(startId = 1, limit = 20): Promise<Campaign[]> {
    try {
      let totalCampaigns = 0;
      try {
        const campaignCountResult = await veCareContract.read.campaignCounter();
        totalCampaigns = Number(campaignCountResult?.[0] ?? 0);
        if (!Number.isFinite(totalCampaigns) || totalCampaigns < 0) totalCampaigns = 0;
      } catch (readError: unknown) {
        // Contract read can return 0x (empty) e.g. wrong RPC or network; treat as no campaigns
        console.warn('campaignCounter() failed (RPC returned 0x?), assuming 0. Try NETWORK_URL=https://node-testnet.vechain.energy');
        totalCampaigns = 0;
      }

      const campaigns: Campaign[] = [];
      const endId = Math.min(startId + limit - 1, totalCampaigns);

      for (let i = startId; i <= endId; i++) {
        try {
          const campaign = await this.getCampaign(i);
          if (campaign) {
            campaigns.push(campaign);
          }
        } catch {
          // Skip campaigns that fail to decode (e.g. 0x response)
        }
      }

      return campaigns;
    } catch (error) {
      console.error('Error getting all campaigns:', error);
      return [];
    }
  }

  /**
   * Get active verified campaigns
   */
  public async getActiveVerifiedCampaigns(): Promise<Campaign[]> {
    try {
      const allCampaigns = await this.getAllCampaigns(1, 100); // Adjust limit as needed
      const now = Math.floor(Date.now() / 1000);

      return allCampaigns.filter(campaign => campaign.isActive && campaign.isVerified && campaign.deadline > now);
    } catch (error) {
      console.error('Error getting active verified campaigns:', error);
      return [];
    }
  }

  /**
   * Get creator profile
   */
  public async getCreatorProfile(creatorAddress: string): Promise<CreatorProfile | null> {
    try {
      const result = await veCareContract.read.getCreatorProfile(creatorAddress);

      if (!result || result.length === 0) {
        return null;
      }

      const profileData = result[0];

      return {
        totalCampaigns: Number(profileData.totalCampaigns),
        successfulCampaigns: Number(profileData.successfulCampaigns),
        totalRaised: unitsUtils.formatUnits(profileData.totalRaised, 'ether'),
        trustScore: Number(profileData.trustScore),
        lastUpdateTimestamp: Number(profileData.lastUpdateTimestamp),
        exists: profileData.exists,
      };
    } catch (error) {
      console.error('Error getting creator profile:', error);
      return null;
    }
  }

  /**
   * Get donation amount for a specific donor
   */
  public async getDonation(campaignId: number, donorAddress: string): Promise<string> {
    try {
      const result = await veCareContract.read.getDonation(campaignId, donorAddress);
      return unitsUtils.formatUnits(result[0], 'ether');
    } catch (error) {
      console.error('Error getting donation:', error);
      return '0';
    }
  }

  /**
   * Check if campaign goal is reached
   */
  public async isGoalReached(campaignId: number): Promise<boolean> {
    try {
      const result = await veCareContract.read.isGoalReached(campaignId);
      return Boolean(result[0]);
    } catch (error) {
      console.error('Error checking goal status:', error);
      return false;
    }
  }

  /**
   * Get campaign update count
   */
  public async getCampaignUpdateCount(campaignId: number): Promise<number> {
    try {
      const result = await veCareContract.read.getCampaignUpdateCount(campaignId);
      return Number(result[0]);
    } catch (error) {
      console.error('Error getting update count:', error);
      return 0;
    }
  }

  /**
   * Validate campaign creation parameters
   */
  public validateCampaignParams(title: string, description: string, goalAmount: string, durationDays: number): void {
    if (!title || title.trim().length === 0) {
      throw new HttpException(400, 'Campaign title is required');
    }

    if (!description || description.trim().length < 50) {
      throw new HttpException(400, 'Campaign description must be at least 50 characters');
    }

    const goal = parseFloat(goalAmount);
    if (isNaN(goal) || goal <= 0) {
      throw new HttpException(400, 'Invalid goal amount');
    }

    if (durationDays < 1 || durationDays > 365) {
      throw new HttpException(400, 'Campaign duration must be between 1 and 365 days');
    }
  }
}
