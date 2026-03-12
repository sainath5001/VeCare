/**
 * IPFS Upload Utility using Pinata
 *
 * Pinata is a reliable IPFS pinning service that ensures your data
 * remains available on the IPFS network.
 *
 * Get your API keys at: https://app.pinata.cloud/
 */

import pinataSDK from '@pinata/sdk';
import { logger } from './logger';

// Initialize Pinata client
let pinata: any = null;

/**
 * Initialize Pinata SDK with API credentials
 */
function initializePinata() {
  if (pinata) return pinata;

  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;

  if (!apiKey || !apiSecret) {
    logger.warn('Pinata credentials not found. IPFS uploads will fail.');
    logger.warn('Please set PINATA_API_KEY and PINATA_API_SECRET in your .env file');
    logger.warn('Get your keys at: https://app.pinata.cloud/');
    return null;
  }

  try {
    pinata = new pinataSDK(apiKey, apiSecret);
    logger.info('Pinata IPFS client initialized successfully');
    return pinata;
  } catch (error) {
    logger.error('Failed to initialize Pinata:', error);
    return null;
  }
}

/**
 * Upload data to IPFS via Pinata
 * @param data - The data to upload (will be converted to JSON)
 * @param metadata - Optional metadata for the pin
 * @returns IPFS hash (CID)
 */
export async function uploadToIPFS(data: any, metadata?: { name?: string; keyvalues?: Record<string, string> }): Promise<string> {
  const client = initializePinata();

  if (!client) {
    throw new Error('Pinata not configured. Please set PINATA_API_KEY and PINATA_API_SECRET environment variables.');
  }

  try {
    // Prepare options with metadata
    const options: any = {};

    if (metadata) {
      options.pinataMetadata = {
        name: metadata.name || `vecare-${Date.now()}`,
        keyvalues: metadata.keyvalues || {},
      };
    }

    // Add custom metadata for VeCare
    options.pinataOptions = {
      cidVersion: 1, // Use CIDv1 for better compatibility
    };

    logger.info('Uploading data to IPFS via Pinata...');

    // Upload JSON to IPFS
    const result = await client.pinJSONToIPFS(data, options);

    logger.info(`Successfully uploaded to IPFS: ${result.IpfsHash}`);
    logger.info(`Pin size: ${result.PinSize} bytes`);
    logger.info(`Timestamp: ${result.Timestamp}`);

    return result.IpfsHash;
  } catch (error) {
    logger.error('Failed to upload to IPFS:', error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Retrieve data from IPFS
 * @param hash - The IPFS hash (CID) to retrieve
 * @returns The data stored at that hash
 */
export async function getFromIPFS(hash: string): Promise<any> {
  try {
    // Use Pinata's dedicated gateway for faster retrieval
    const gatewayUrl = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
    const url = `${gatewayUrl}/ipfs/${hash}`;

    logger.info(`Retrieving data from IPFS: ${hash}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('Successfully retrieved data from IPFS');

    return data;
  } catch (error) {
    logger.error('Failed to retrieve from IPFS:', error);
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
}

/**
 * Unpin data from IPFS (remove from Pinata)
 * Use this to clean up old campaign data if needed
 * @param hash - The IPFS hash to unpin
 */
export async function unpinFromIPFS(hash: string): Promise<boolean> {
  const client = initializePinata();

  if (!client) {
    logger.warn('Pinata not configured. Cannot unpin.');
    return false;
  }

  try {
    logger.info(`Unpinning from IPFS: ${hash}`);
    await client.unpin(hash);
    logger.info('Successfully unpinned from IPFS');
    return true;
  } catch (error) {
    logger.error('Failed to unpin from IPFS:', error);
    return false;
  }
}

/**
 * Test Pinata connection
 * @returns true if connection is successful
 */
export async function testPinataConnection(): Promise<boolean> {
  const client = initializePinata();

  if (!client) {
    return false;
  }

  try {
    await client.testAuthentication();
    logger.info('Pinata authentication successful');
    return true;
  } catch (error) {
    logger.error('Pinata authentication failed:', error);
    return false;
  }
}

/**
 * Get pin list from Pinata (for monitoring)
 * @param filters - Optional filters for the pin list
 */
export async function getPinList(filters?: { status?: 'pinned' | 'unpinned'; pageLimit?: number; pageOffset?: number }): Promise<any> {
  const client = initializePinata();

  if (!client) {
    throw new Error('Pinata not configured');
  }

  try {
    const result = await client.pinList(filters);
    return result;
  } catch (error) {
    logger.error('Failed to get pin list:', error);
    throw error;
  }
}
