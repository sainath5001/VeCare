import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { CampaignController } from '@/controllers/campaign.controller';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateCampaignDto } from '@/dtos/campaign.dto';

export class CampaignRoute implements Routes {
  public router = Router();
  public campaign = new CampaignController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create a new campaign
    this.router.post(`/campaigns`, ValidationMiddleware(CreateCampaignDto), this.campaign.createCampaign);

    // Get campaign by ID
    this.router.get(`/campaigns/:id`, this.campaign.getCampaign);

    // Get all campaigns (paginated)
    this.router.get(`/campaigns`, this.campaign.getAllCampaigns);

    // Get active verified campaigns
    this.router.get(`/campaigns/active/verified`, this.campaign.getActiveVerifiedCampaigns);

    // Get creator profile
    this.router.get(`/creators/:address`, this.campaign.getCreatorProfile);

    // Get donation details
    this.router.get(`/campaigns/:campaignId/donations/:donorAddress`, this.campaign.getDonation);

    // Check if goal is reached
    this.router.get(`/campaigns/:id/goal-reached`, this.campaign.checkGoalReached);

    // Get campaign updates count
    this.router.get(`/campaigns/:id/updates`, this.campaign.getCampaignUpdates);

    // Verify documents only (preview)
    this.router.post(`/verify-documents`, this.campaign.verifyDocuments);

    // Upload to IPFS (helper endpoint for frontend)
    this.router.post(`/campaigns/ipfs`, this.campaign.uploadToIPFS);

    // Verify campaign on-chain (admin or auto-verification)
    this.router.post(`/campaigns/:id/verify`, this.campaign.verifyCampaignOnChain);
  }
}
