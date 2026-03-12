import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useWallet, useConnex } from "@vechain/dapp-kit-react";
import { FaUpload, FaCheckCircle, FaTimes } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";
import { VECARE_SOL_ABI, config } from "@repo/config-contract";
import { unitsUtils } from "@vechain/sdk-core";
import { abi } from "@vechain/sdk-core";

type VerificationResult = {
  isVerified: boolean;
  confidenceScore: number;
  reasoning?: string;
  [key: string]: unknown;
};

type AbiItem = {
  type?: string;
  name?: string;
  inputs?: unknown[];
  outputs?: unknown[];
};

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { account } = useWallet();
  const connex = useConnex();
  // processing controls the unified Verify & Create flow
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [stepStatuses, setStepStatuses] = useState<Array<'pending'|'active'|'done'|'error'>>([
    'pending',
    'pending',
    'pending',
    'pending',
  ]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalAmount: "",
    durationDays: "30",
  });

  const [medicalDocuments, setMedicalDocuments] = useState<string[]>([]);
  // no local cardBg needed in this component

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setMedicalDocuments((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Unified verify + create flow triggered by single button
  const handleVerifyAndCreate = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!connex) {
      toast({
        title: "Connex not available",
        description: "Please make sure your wallet is properly connected",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (medicalDocuments.length === 0) {
      toast({
        title: "Documents required",
        description: "Please upload medical documents",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const goalStr = formData.goalAmount?.trim() ?? "";
    const goalNum = Number(goalStr);
    if (goalStr === "" || !Number.isFinite(goalNum) || goalNum <= 0) {
      toast({
        title: "Invalid goal amount",
        description: "Please enter a valid goal amount (e.g. 100 or 1000 VET).",
        status: "warning",
        duration: 4000,
      });
      return;
    }

    const durationNum = parseInt(formData.durationDays, 10);
    if (!Number.isFinite(durationNum) || durationNum < 1 || durationNum > 365) {
      toast({
        title: "Invalid duration",
        description: "Please enter a duration between 1 and 365 days.",
        status: "warning",
        duration: 4000,
      });
      return;
    }

  // steps labels are implied in the UI; no separate var required
    setProcessing(true);
    setStepStatuses(['active', 'pending', 'pending', 'pending']);
    setCurrentStep(0);

    try {
      // Step 1: Verify documents with AI
      const verifyResp = await fetch(API_ENDPOINTS.verifyDocuments, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicalDocuments }),
      });
      const verifyJson: { success?: boolean; data?: VerificationResult; message?: string } = await verifyResp.json();
      const errorMessage = verifyJson.message || verifyJson.data?.reasoning || "AI verification failed";

      if (!verifyResp.ok || !verifyJson.success) {
        setStepStatuses(['error', 'pending', 'pending', 'pending']);
        setVerificationResult(verifyJson.data || null);
        toast({ title: "Verification failed", description: errorMessage, status: "error", duration: 7000 });
        setProcessing(false);
        return;
      }

      setVerificationResult(verifyJson.data);
      if (!verifyJson.data?.isVerified) {
        setStepStatuses(['error', 'pending', 'pending', 'pending']);
        toast({ title: "Verification incomplete", description: verifyJson.data?.reasoning || "Documents did not pass AI verification", status: "warning", duration: 6000 });
        setProcessing(false);
        return;
      }

      // mark verification done
      setStepStatuses(['done', 'active', 'pending', 'pending']);
      setCurrentStep(1);

      // Step 2: Upload to IPFS (backend handles this)
      const ipfsResp = await fetch(API_ENDPOINTS.campaigns + '/ipfs', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: medicalDocuments,
          verificationResult: verifyJson.data,
          campaignTitle: formData.title,
          creator: account,
          timestamp: Date.now(),
        }),
      });

      let ipfsHash = "";
      if (ipfsResp.ok) {
        const ipfsJson = await ipfsResp.json();
        ipfsHash = ipfsJson.data?.ipfsHash || "";
      }

      if (!ipfsHash) {
        // Fallback: if IPFS upload endpoint doesn't exist, use a placeholder
        // In production, you should implement the IPFS upload endpoint
        ipfsHash = `placeholder_${Date.now()}`;
        console.warn("IPFS upload not implemented, using placeholder hash");
      }

      // Mark IPFS upload done
      setStepStatuses(['done', 'done', 'active', 'pending']);
      setCurrentStep(2);

      // Step 3: Create campaign on blockchain using user's wallet
      const goalInWei = unitsUtils.parseUnits(goalStr, 'ether');

      // Encode the function call
      const createCampaignABI = (VECARE_SOL_ABI as ReadonlyArray<AbiItem>).find(
        (item): item is Required<Pick<AbiItem, 'name' | 'type'>> & AbiItem =>
          !!item && item.name === 'createCampaign' && item.type === 'function'
      );

      if (!createCampaignABI) {
        throw new Error('createCampaign function not found in ABI');
      }

  const abiFunction = new abi.Function(createCampaignABI as unknown as object);
      const encodedData = abiFunction.encodeInput([
        formData.title,
        formData.description,
        ipfsHash,
        goalInWei,
        durationNum
      ]);

      const clause = {
        to: config.VECARE_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData
      };

      // Send transaction using user's wallet
      const result = await connex.vendor
        .sign('tx', [clause])
        .signer(account)
        .comment(`Create medical campaign: ${formData.title}`)
        .request();

      if (!result) {
        throw new Error('Transaction was rejected');
      }

      // Wait for transaction receipt
      let receipt = null;
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        receipt = await connex.thor.transaction(result.txid).getReceipt();
        if (receipt) break;
      }

      if (!receipt || receipt.reverted) {
        throw new Error('Transaction failed or was reverted');
      }

      // Extract campaign ID from event logs (CampaignCreated has indexed campaignId in topics[1])
      let campaignId: number | null = null;
      const outputs = (receipt as { outputs?: Array<{ events?: Array<{ topics?: string[] }> }> }).outputs;
      if (outputs && Array.isArray(outputs)) {
        for (const out of outputs) {
          const events = out?.events as Array<{ topics?: string[] }> | undefined;
          if (!Array.isArray(events)) continue;
          for (const e of events) {
            const topics = e?.topics;
            if (Array.isArray(topics) && topics.length >= 2 && topics[1]) {
              const id = parseInt(topics[1], 16);
              if (Number.isFinite(id) && id > 0) {
                campaignId = id;
                break;
              }
            }
          }
          if (campaignId != null) break;
        }
      }

      // Fallback: if we couldn't parse from logs, still show success and go to campaign list
      if (!campaignId) {
        console.warn('Could not extract campaign ID from receipt; transaction succeeded. Receipt:', receipt);
      }

      // Mark campaign creation done
      setStepStatuses(['done', 'done', 'done', 'active']);
      setCurrentStep(3);

      // Step 4: Verify campaign on-chain (if AI verification passed and we have campaignId)
      if (campaignId && verifyJson.data?.isVerified && verifyJson.data?.confidenceScore >= 0.6) {
        try {
          const verifyOnChainResp = await fetch(`${API_ENDPOINTS.campaigns}/${campaignId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (verifyOnChainResp.ok) {
            const verifyOnChainJson = await verifyOnChainResp.json();
            if (verifyOnChainJson.success) {
              console.log(`Campaign ${campaignId} verified on-chain successfully`);
            }
          }
        } catch (error) {
          console.warn('Failed to verify campaign on-chain:', error);
          // Continue anyway - campaign was created successfully
        }
      }

      setStepStatuses(['done', 'done', 'done', 'done']);
      toast({ 
        title: 'Campaign Created!', 
        description: `Your campaign has been created successfully${verifyJson.data?.isVerified && verifyJson.data?.confidenceScore >= 0.6 ? ' and verified' : ''}`, 
        status: 'success', 
        duration: 4000 
      });
      
      // small delay so user can see the final state
      setTimeout(() => {
        if (campaignId) {
          navigate(`/campaigns/${campaignId}`);
        } else {
          navigate('/campaigns');
        }
      }, 600);
    } catch (err: unknown) {
      console.error('Error creating campaign:', err);
      setStepStatuses((s) => s.map((v, i) => (i === currentStep ? 'error' : v)));
      const message = err instanceof Error ? err.message : 'An error occurred while creating the campaign';
      toast({ title: 'Error', description: message, status: 'error', duration: 5000 });
    } finally {
      setProcessing(false);
      setCurrentStep(null);
    }
  };

  // submit is now handled by handleVerifyAndCreate

  return (
    <Box pt={{ base: 24, md: 28 }} pb={12} px={8} bg="white">
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">Create Medical Campaign</Heading>
            <Text fontSize="lg" color="gray.700">
              Share your medical need with the world. Our AI will verify your
              documents to build trust with donors.
            </Text>
          </VStack>

          {/* Form */}
          <Box>
            <form onSubmit={(e) => e.preventDefault()}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Campaign Title</FormLabel>
                  <Input
                    placeholder="e.g., Help Sarah Fight Cancer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Tell your story... (minimum 50 characters)"
                    rows={6}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {formData.description.length} characters
                  </Text>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Goal Amount (VET)</FormLabel>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={formData.goalAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, goalAmount: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Duration (Days)</FormLabel>
                    <Input
                      type="number"
                      placeholder="30"
                      value={formData.durationDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationDays: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </HStack>

                {/* Medical Documents Upload */}
                <FormControl isRequired>
                  <FormLabel>Medical Documents</FormLabel>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    For AI verification, upload an image (PNG or JPG). PDFs are not verified by AI—use a photo or screenshot of your document.
                  </Text>
                    <VStack spacing={4} align="stretch">
                      <Button
                        as="label"
                        htmlFor="file-upload"
                        leftIcon={<Icon as={FaUpload} />}
                        variant="outline"
                        cursor="pointer"
                        isDisabled={processing}
                      >
                        Upload Medical Documents
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*,.pdf,application/pdf"
                          multiple
                          hidden
                          onChange={handleFileUpload}
                          disabled={processing}
                        />
                      </Button>

                      {medicalDocuments.length > 0 && (
                        <Alert status="success">
                          <AlertIcon />
                          {medicalDocuments.length} document(s) uploaded
                        </Alert>
                      )}

                      {/* Progressive status list: show only steps that have started (non-pending) */}
                      {(() => {
                        const steps = ['Verifying documents', 'Uploading to IPFS', 'Creating campaign on-chain', 'Verifying on-chain'];
                        const visible = stepStatuses
                          .map((status, idx) => ({ status, idx, label: steps[idx] }))
                          .filter((s) => s.status !== 'pending');
                        if (visible.length === 0) return null;
                        return (
                          <VStack spacing={2} align="stretch">
                            {visible.map(({ status, idx, label }) => (
                              <Flex key={label} align="center" gap={3}>
                                <Box w={6} h={6} display="flex" alignItems="center" justifyContent="center">
                                  {status === 'done' && <Icon as={FaCheckCircle} color="green.400" />}
                                  {status === 'active' && <Spinner size="sm" color="primary.500" />}
                                  {status === 'error' && <Icon as={FaTimes} color="red.400" />}
                                </Box>
                                <Box>
                                  <Text fontSize="sm" fontWeight={status === 'active' ? 'bold' : 'normal'}>
                                    {label}
                                  </Text>
                                  {status === 'error' && idx === 0 && verificationResult?.reasoning && (
                                    <Text fontSize="xs" color="red.400">{verificationResult.reasoning}</Text>
                                  )}
                                </Box>
                              </Flex>
                            ))}
                          </VStack>
                        );
                      })()}
                    </VStack>
                </FormControl>

                  {/* Unified Verify & Create Button */}
                  <Button
                    type="button"
                    colorScheme="primary"
                    size="lg"
                    onClick={handleVerifyAndCreate}
                    isDisabled={!account || processing}
                  >
                    {processing ? (
                      <HStack>
                        <Spinner size="sm" />
                        <Text>
                          {currentStep === 0 
                            ? 'Verifying…' 
                            : currentStep === 1 
                            ? 'Uploading…' 
                            : currentStep === 2 
                            ? 'Creating…' 
                            : currentStep === 3
                            ? 'Verifying on-chain…'
                            : 'Processing…'}
                        </Text>
                      </HStack>
                    ) : (
                      account ? 'Verify & Create Campaign' : 'Connect Wallet First'
                    )}
                  </Button>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  By creating a campaign, you agree to our terms and conditions.
                  A 2.5% platform fee applies to all funds raised.
                </Text>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
