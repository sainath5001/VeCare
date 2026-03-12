import { IsString, IsNumber, IsArray, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  public title: string;

  @IsString()
  @MinLength(50)
  @MaxLength(5000)
  public description: string;

  @IsArray()
  @IsString({ each: true })
  public medicalDocuments: string[]; // Base64 encoded images

  @IsString()
  public goalAmount: string; // In VET

  @IsNumber()
  @Min(1)
  @Max(365)
  public durationDays: number;

  @IsString()
  public creatorAddress: string;
}

export class VerifyCampaignDto {
  @IsNumber()
  public campaignId: number;

  @IsString()
  public adminAddress: string;
}

export class GetCampaignDto {
  @IsNumber()
  public campaignId: number;
}

export class PostUpdateDto {
  @IsNumber()
  public campaignId: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  public updateMessage: string;

  @IsString()
  public creatorAddress: string;
}
