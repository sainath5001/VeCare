import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { MedicalVerificationService } from '@/services/medical-verification.service';
import { VeCareContractsService } from '@/services/vecare-contracts.service';
import { HttpException } from '@/exceptions/HttpException';
import { CreateCampaignRequest, CampaignVerificationResult } from '@/interfaces/campaign.interface';
import { uploadToIPFS } from '@/utils/ipfs';

export class CampaignController {
  public medicalVerification = Container.get(MedicalVerificationService);
  public veCareContracts = Container.get(VeCareContractsService);

  /**
   * Create a new campaign with AI verification
   */
  public createCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body: CreateCampaignRequest = req.body;

      // Validate campaign parameters
      this.veCareContracts.validateCampaignParams(body.title, body.description, body.goalAmount, body.durationDays);

      // Verify medical documents with AI
      const verificationResult = await this.medicalVerification.verifyMedicalDocuments(body.medicalDocuments);

      // Store medical documents on IPFS with metadata
      const ipfsHash = await uploadToIPFS(
        {
          documents: body.medicalDocuments,
          verificationResult,
          campaignTitle: body.title,
          creator: body.creatorAddress,
          timestamp: Date.now(),
        },
        {
          name: `vecare-campaign-${body.title.substring(0, 30)}`,
          keyvalues: {
            type: 'medical-campaign',
            creator: body.creatorAddress,
            verified: verificationResult.isVerified.toString(),
            confidenceScore: verificationResult.confidenceScore.toString(),
          },
        },
      );

      // Create campaign on blockchain
      const campaignResult = await this.veCareContracts.createCampaign(body.title, body.description, ipfsHash, body.goalAmount, body.durationDays);

      if (!campaignResult.success) {
        throw new HttpException(500, 'Failed to create campaign on blockchain');
      }

      // Auto-verify if AI confidence is high
      if (verificationResult.isVerified && verificationResult.confidenceScore >= 0.6 && campaignResult.campaignId) {
        try {
          const verified = await this.veCareContracts.verifyCampaign(campaignResult.campaignId, true);
          console.log(`Campaign ${campaignResult.campaignId} verification on-chain:`, verified);
        } catch (error) {
          console.error('Error verifying campaign on-chain:', error);
          // Continue even if verification fails - campaign is still created
        }
      }

      const response: CampaignVerificationResult = {
        campaignId: campaignResult.campaignId ?? -1,
        isVerified: verificationResult.isVerified && verificationResult.confidenceScore >= 0.8,
        verificationDetails: {
          confidenceScore: verificationResult.confidenceScore,
          documentType: verificationResult.documentType,
          findings: verificationResult.findings,
          reasoning: verificationResult.reasoning,
          redFlags: verificationResult.redFlags,
        },
      };

      res.status(201).json({
        success: true,
        data: response,
        txId: campaignResult.txId,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get campaign by ID
   */
  public getCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaignId = parseInt(req.params.id);

      if (isNaN(campaignId)) {
        throw new HttpException(400, 'Invalid campaign ID');
      }

      const campaign = await this.veCareContracts.getCampaign(campaignId);

      if (!campaign) {
        throw new HttpException(404, 'Campaign not found');
      }

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all campaigns with pagination
   */
  public getAllCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const startId = (page - 1) * limit + 1;

      const campaigns = await this.veCareContracts.getAllCampaigns(startId, limit);

      res.status(200).json({
        success: true,
        data: campaigns,
        pagination: {
          page,
          limit,
          count: campaigns.length,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active verified campaigns
   */
  public getActiveVerifiedCampaigns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaigns = await this.veCareContracts.getActiveVerifiedCampaigns();

      res.status(200).json({
        success: true,
        data: campaigns,
        count: campaigns.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get creator profile
   */
  public getCreatorProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creatorAddress = req.params.address;

      if (!creatorAddress) {
        throw new HttpException(400, 'Creator address is required');
      }

      const profile = await this.veCareContracts.getCreatorProfile(creatorAddress);

      if (!profile || !profile.exists) {
        throw new HttpException(404, 'Creator profile not found');
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get donation details
   */
  public getDonation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const donorAddress = req.params.donorAddress;

      if (isNaN(campaignId) || !donorAddress) {
        throw new HttpException(400, 'Invalid parameters');
      }

      const donationAmount = await this.veCareContracts.getDonation(campaignId, donorAddress);

      res.status(200).json({
        success: true,
        data: {
          campaignId,
          donorAddress,
          amount: donationAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if campaign goal is reached
   */
  public checkGoalReached = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaignId = parseInt(req.params.id);

      if (isNaN(campaignId)) {
        throw new HttpException(400, 'Invalid campaign ID');
      }

      const isGoalReached = await this.veCareContracts.isGoalReached(campaignId);

      res.status(200).json({
        success: true,
        data: {
          campaignId,
          goalReached: isGoalReached,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get campaign updates count
   */
  public getCampaignUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaignId = parseInt(req.params.id);

      if (isNaN(campaignId)) {
        throw new HttpException(400, 'Invalid campaign ID');
      }

      const updateCount = await this.veCareContracts.getCampaignUpdateCount(campaignId);

      res.status(200).json({
        success: true,
        data: {
          campaignId,
          updateCount,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /verify-documents
   * @desc    Verify medical documents with AI (preview mode)
   * @access  Public
   */
  public verifyDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { medicalDocuments } = req.body;

      if (!medicalDocuments || !Array.isArray(medicalDocuments) || medicalDocuments.length === 0) {
        throw new HttpException(400, 'Medical documents are required');
      }

      const verificationResult = await this.medicalVerification.verifyMedicalDocuments(medicalDocuments);

      res.status(200).json({
        success: true,
        data: verificationResult,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /campaigns/ipfs
   * @desc    Upload campaign data to IPFS
   * @access  Public
   */
  public uploadToIPFS = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documents, verificationResult, campaignTitle, creator, timestamp } = req.body;

      if (!documents || !Array.isArray(documents)) {
        throw new HttpException(400, 'Documents are required');
      }

      // Upload to IPFS with metadata
      const ipfsHash = await uploadToIPFS(
        {
          documents,
          verificationResult,
          campaignTitle,
          creator,
          timestamp: timestamp || Date.now(),
        },
        {
          name: `vecare-campaign-${campaignTitle?.substring(0, 30) || 'untitled'}`,
          keyvalues: {
            type: 'medical-campaign',
            creator: creator || 'unknown',
            verified: verificationResult?.isVerified?.toString() || 'false',
            confidenceScore: verificationResult?.confidenceScore?.toString() || '0',
          },
        },
      );

      res.status(200).json({
        success: true,
        data: {
          ipfsHash,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   POST /campaigns/:id/verify
   * @desc    Manually verify a campaign on-chain (Admin only)
   * @access  Admin
   */
  public verifyCampaignOnChain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const campaignId = parseInt(req.params.id);

      if (isNaN(campaignId) || campaignId <= 0) {
        throw new HttpException(400, 'Invalid campaign ID');
      }

      // Verify the campaign on-chain
      const success = await this.veCareContracts.verifyCampaign(campaignId, true);

      if (success) {
        res.status(200).json({
          success: true,
          message: `Campaign ${campaignId} has been verified on-chain`,
          data: {
            campaignId,
            isVerified: true,
          },
        });
      } else {
        throw new HttpException(500, 'Failed to verify campaign on blockchain');
      }
    } catch (error) {
      next(error);
    }
  };
}
