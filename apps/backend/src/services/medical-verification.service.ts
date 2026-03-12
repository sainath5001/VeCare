import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';

export interface MedicalVerificationResult {
  isVerified: boolean;
  confidenceScore: number; // 0-1
  documentType: string;
  findings: string[];
  reasoning: string;
  redFlags: string[];
}

@Service()
export class MedicalVerificationService {
  /**
   * Verify medical documents using AI
   * Analyzes authenticity, legitimacy, and medical validity
   */
  public async verifyMedicalDocuments(images: string[]): Promise<MedicalVerificationResult> {
    if (!images || images.length === 0) {
      throw new HttpException(400, 'No medical documents provided');
    }

    // Validate all images are in correct format
    for (const image of images) {
      if (!isBase64Image(image)) {
        throw new HttpException(400, 'Invalid image format detected');
      }
    }

    const prompt = `Analyze this medical document and return ONLY a JSON object with this exact structure:

{
  "isVerified": true or false,
  "confidenceScore": 0.0 to 1.0,
  "documentType": "type of document",
  "findings": ["finding 1", "finding 2"],
  "reasoning": "brief explanation",
  "redFlags": ["red flag 1"] or []
}

Verification criteria:
1. Is this a genuine medical document (doctor's letter, hospital bill, prescription, diagnosis report)?
2. Does it contain medical information (diagnosis, treatment, costs)?
3. Are there credibility indicators (doctor name, date, hospital info)?
4. Any red flags (screenshot, poor quality, inconsistencies)?

Rules:
- confidenceScore above 0.7 with no major red flags = isVerified: true
- Be lenient with scanned/photographed documents
- Focus on medical need verification
- Keep reasoning brief and empathetic

CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no code blocks. Just the raw JSON.`;

    try {
      // Optional: skip real AI call in development when OpenAI quota is exceeded (e.g. no billing)
      const skipAi = process.env.SKIP_AI_VERIFICATION === 'true' || process.env.SKIP_AI_VERIFICATION === '1';
      if (process.env.NODE_ENV === 'development' && skipAi) {
        console.log('[Medical verification] Using mock result (SKIP_AI_VERIFICATION is set). No OpenAI call.');
        return {
          isVerified: true,
          confidenceScore: 0.85,
          documentType: 'Development mock',
          findings: ['Document provided for testing'],
          reasoning: 'Verification skipped in development (SKIP_AI_VERIFICATION=true). Add billing at platform.openai.com to use real AI.',
          redFlags: [],
        };
      }

      // For multiple images, analyze the first one (can be extended to analyze all)
      const primaryImage = images[0];

      const gptResponse = await openAIHelper.askChatGPTAboutImage({
        base64Image: primaryImage,
        prompt,
      });

      let responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);

      // Clean up the response - remove markdown code blocks if present
      responseJSONStr = responseJSONStr.trim();
      if (responseJSONStr.startsWith('```json')) {
        responseJSONStr = responseJSONStr.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (responseJSONStr.startsWith('```')) {
        responseJSONStr = responseJSONStr.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      // Try to parse the JSON
      let result: MedicalVerificationResult;
      try {
        result = JSON.parse(responseJSONStr) as MedicalVerificationResult;
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseJSONStr);
        console.error('Parse error:', parseError);

        // Return a safe default response
        return {
          isVerified: false,
          confidenceScore: 0.3,
          documentType: 'Unknown',
          findings: [],
          reasoning:
            'Unable to verify document. The AI response could not be processed. Please try uploading a clearer image of your medical document.',
          redFlags: ['AI verification system returned an invalid response'],
        };
      }

      // Validate response structure
      if (!result || typeof result.isVerified !== 'boolean' || typeof result.confidenceScore !== 'number') {
        console.error('Invalid AI response structure:', result);
        throw new HttpException(500, 'Invalid AI verification response structure');
      }

      return result;
    } catch (error) {
      console.error('Medical verification error:', error);

      // If it's already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // In development, surface the real error so you can fix it (e.g. OpenAI key, network)
      const message =
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'Error during medical document verification';
      throw new HttpException(500, message);
    }
  }

  /**
   * Quick validation for document format and basic requirements
   */
  public async quickValidate(image: string): Promise<{ valid: boolean; message: string }> {
    if (!isBase64Image(image)) {
      return { valid: false, message: 'Invalid image format' };
    }

    // Additional quick checks can be added here
    return { valid: true, message: 'Document format valid' };
  }
}
