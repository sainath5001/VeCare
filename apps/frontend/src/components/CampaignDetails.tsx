import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  Divider,
  Input,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet, useConnex } from "@vechain/dapp-kit-react";
import { FaCheckCircle, FaHeart, FaClock, FaUsers } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";
import { VECARE_SOL_ABI, config } from "@repo/config-contract";
import { unitsUtils, abi as abiUtils } from "@vechain/sdk-core";

interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  goalAmount: string;
  raisedAmount: string;
  deadline: number;
  isVerified: boolean;
  donorCount: number;
  createdAt: number;
  fundsWithdrawn: boolean;
  isActive: boolean;
}

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { account } = useWallet();
  const connex = useConnex();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const cardBg = useColorModeValue("white", "gray.800");

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(API_ENDPOINTS.campaign(Number(id)));
      const data = await response.json();
      if (data.success) {
        setCampaign(data.data as Campaign);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleDonate = async () => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to donate",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setDonating(true);
    try {
      // Convert VET to Wei
      const amountInWei = unitsUtils.parseUnits(donationAmount, 'ether');
      
      // Encode the donate function call using VeChain SDK
      type AbiItem = { type?: string; name?: string };
      const donateAbi = (VECARE_SOL_ABI as ReadonlyArray<AbiItem>).find(
        (item): item is Required<Pick<AbiItem, 'name' | 'type'>> & AbiItem =>
          !!item && item.name === 'donate' && item.type === 'function'
      );
      const donateFunction = new abiUtils.Function(donateAbi as unknown as object);
      const encodedData = donateFunction.encodeInput([campaign!.id]);
      
      // Create contract clause for donation
      const clause = {
        to: config.VECARE_CONTRACT_ADDRESS,
        value: amountInWei.toString(),
        data: encodedData,
      };

      // Send transaction using Connex
      if (!connex) {
        throw new Error('Please connect your wallet');
      }

      const result = await connex.vendor
        .sign('tx', [clause])
        .signer(account)
        .comment(`Donate ${donationAmount} VET to campaign: ${campaign!.title}`)
        .request();

      toast({
        title: "Transaction Sent!",
        description: "Waiting for confirmation...",
        status: "info",
        duration: 3000,
      });

      // Wait for transaction receipt
      const receipt = await connex.thor.transaction(result.txid).getReceipt();
      
      if (receipt) {
        console.log('Transaction receipt:', receipt);
        
        // Check if transaction was successful
        if (receipt.reverted) {
          console.error('Transaction reverted:', receipt);
          throw new Error('Transaction reverted');
        }
        
        toast({
          title: "Donation Successful!",
          description: `You donated ${donationAmount} VET and earned B3tr tokens!`,
          status: "success",
          duration: 5000,
        });
        setDonationAmount("");
        fetchCampaign(); // Refresh campaign data
      } else {
        // No receipt yet, but transaction was sent - assume success for now
        console.log('No receipt available yet, but transaction sent');
        toast({
          title: "Transaction Sent!",
          description: `Your donation of ${donationAmount} VET is being processed. Check the explorer for status.`,
          status: "info",
          duration: 5000,
        });
        setDonationAmount("");
        fetchCampaign(); // Refresh campaign data
      }
    } catch (error: unknown) {
      console.error('Donation error:', error);
      toast({
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 3000,
      });
    } finally {
      setDonating(false);
    }
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    const raised = parseFloat(campaign.raisedAmount);
    const goal = parseFloat(campaign.goalAmount);
    return (raised / goal) * 100;
  };

  const formatTimeRemaining = () => {
    if (!campaign) return "";
    const now = Math.floor(Date.now() / 1000);
    const remaining = campaign.deadline - now;
    const days = Math.floor(remaining / 86400);
    if (days > 0) return `${days} days remaining`;
    const hours = Math.floor(remaining / 3600);
    if (hours > 0) return `${hours} hours remaining`;
    return "Ending soon";
  };

  const canWithdraw = () => {
    if (!campaign || !account) return false;
    if (campaign.creator.toLowerCase() !== account.toLowerCase()) return false;
    if (campaign.fundsWithdrawn) return false;
    if (parseFloat(campaign.raisedAmount) === 0) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now >= campaign.deadline;
    const isGoalReached = parseFloat(campaign.raisedAmount) >= parseFloat(campaign.goalAmount);
    
    return isExpired || isGoalReached;
  };

  const handleWithdraw = async () => {
    if (!account || !campaign) return;

    setWithdrawing(true);
    try {
      // Encode the withdrawFunds function call
      type AbiItem2 = { type?: string; name?: string };
      const withdrawAbi = (VECARE_SOL_ABI as ReadonlyArray<AbiItem2>).find(
        (item): item is Required<Pick<AbiItem2, 'name' | 'type'>> & AbiItem2 =>
          !!item && item.name === 'withdrawFunds' && item.type === 'function'
      );
      const withdrawFunction = new abiUtils.Function(withdrawAbi as unknown as object);
      const encodedData = withdrawFunction.encodeInput([campaign.id]);
      
      // Create contract clause for withdrawal
      const clause = {
        to: config.VECARE_CONTRACT_ADDRESS,
        value: '0',
        data: encodedData,
      };

      // Send transaction using Connex
      if (!connex) {
        throw new Error('Please connect your wallet');
      }

      const result = await connex.vendor
        .sign('tx', [clause])
        .signer(account)
        .comment(`Withdraw funds from campaign: ${campaign.title}`)
        .request();

      toast({
        title: "Transaction Sent!",
        description: "Waiting for confirmation...",
        status: "info",
        duration: 3000,
      });

      // Wait for transaction receipt
      const receipt = await connex.thor.transaction(result.txid).getReceipt();
      
      if (receipt) {
        if (receipt.reverted) {
          throw new Error('Transaction reverted');
        }
        
        toast({
          title: "Withdrawal Successful!",
          description: `Funds have been transferred to your wallet (minus 2.5% platform fee)`,
          status: "success",
          duration: 5000,
        });
        fetchCampaign(); // Refresh campaign data
      } else {
        toast({
          title: "Transaction Sent!",
          description: `Your withdrawal is being processed. Check the explorer for status.`,
          status: "info",
          duration: 5000,
        });
        fetchCampaign();
      }
    } catch (error: unknown) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Please try again",
        status: "error",
        duration: 3000,
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <Box bg="white">
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text>Loading campaign...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (!campaign) {
    return (
      <Box bg="white">
        <Center h="60vh">
          <VStack spacing={4}>
            <Text fontSize="xl">Campaign not found</Text>
            <Button onClick={() => navigate("/campaigns")}>
              Browse Campaigns
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="white" pt={{ base: 24, md: 28 }} pb={12} px={8}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Main Content */}
          <Box gridColumn={{ base: "1", lg: "1 / 3" }}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <Box>
                <HStack mb={4}>
                  <Badge
                    colorScheme="green"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    <Icon as={FaCheckCircle} />
                    AI Verified
                  </Badge>
                </HStack>
                <Heading size="2xl" mb={4}>
                  {campaign.title}
                </Heading>
                <Text fontSize="lg" color="gray.700">
                  {campaign.description}
                </Text>
              </Box>

              <Divider />

              {/* Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaHeart} color="red.500" />
                      <Text>Raised</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="blue.600">
                    {campaign.raisedAmount} VET
                  </StatNumber>
                  <StatHelpText>of {campaign.goalAmount} VET</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaUsers} color="blue.500" />
                      <Text>Donors</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{campaign.donorCount}</StatNumber>
                  <StatHelpText>supporters</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={FaClock} color="orange.500" />
                      <Text>Time Left</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="lg">
                    {formatTimeRemaining().split(" ")[0]}
                  </StatNumber>
                  <StatHelpText>
                    {formatTimeRemaining().split(" ")[1]}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Progress</StatLabel>
                  <StatNumber fontSize="lg">
                    {calculateProgress().toFixed(0)}%
                  </StatNumber>
                  <StatHelpText>of goal</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Progress Bar */}
              <Box>
                <Progress
                  value={calculateProgress()}
                  colorScheme="primary"
                  size="lg"
                  borderRadius="full"
                />
              </Box>

              <Divider />

              {/* Campaign Info */}
              <Box>
                <Heading size="md" mb={4}>
                  Campaign Information
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text color="gray.700">Creator</Text>
                    <Text fontFamily="mono" fontSize="sm">
                      {campaign.creator.slice(0, 6)}...
                      {campaign.creator.slice(-4)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.700">Created</Text>
                    <Text>
                      {new Date(campaign.createdAt * 1000).toLocaleDateString()}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.700">Campaign ID</Text>
                    <Text>#{campaign.id}</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Donation/Withdrawal Sidebar */}
          <Box>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              shadow="lg"
              position="sticky"
              top={4}
            >
              {/* Show withdrawal option if user is the creator */}
              {account &&
              campaign.creator.toLowerCase() === account.toLowerCase() ? (
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Campaign Management</Heading>

                  {campaign.fundsWithdrawn ? (
                    <VStack spacing={4}>
                      <Badge colorScheme="green" fontSize="lg" p={3}>
                        ✅ Funds Withdrawn
                      </Badge>
                      <Text fontSize="sm" color="gray.700" textAlign="center">
                        You have already withdrawn the funds from this campaign.
                      </Text>
                    </VStack>
                  ) : canWithdraw() ? (
                    <VStack spacing={4} align="stretch">
                      <Badge colorScheme="primary" fontSize="md" p={2}>
                        💰 Ready to Withdraw
                      </Badge>
                      <Text fontSize="sm" color="gray.700">
                        Campaign has ended or reached its goal. You can now
                        withdraw the funds.
                      </Text>
                      <Box bg="blue.50" p={4} borderRadius="md">
                        <VStack align="start" spacing={2}>
                          <Text fontSize="sm" fontWeight="bold">
                            Withdrawal Summary:
                          </Text>
                          <Text fontSize="sm">
                            Raised: {campaign.raisedAmount} VET
                          </Text>
                          <Text fontSize="sm">
                            Platform Fee (2.5%):{" "}
                            {(
                              parseFloat(campaign.raisedAmount) * 0.025
                            ).toFixed(4)}{" "}
                            VET
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="green.600"
                          >
                            You'll receive:{" "}
                            {(
                              parseFloat(campaign.raisedAmount) * 0.975
                            ).toFixed(4)}{" "}
                            VET
                          </Text>
                        </VStack>
                      </Box>
                      <Button
                        colorScheme="primary"
                        size="lg"
                        onClick={handleWithdraw}
                        isLoading={withdrawing}
                        loadingText="Withdrawing..."
                      >
                        Withdraw Funds
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={4}>
                      <Badge colorScheme="orange" fontSize="md" p={2}>
                        ⏳ Not Yet Available
                      </Badge>
                      <Text fontSize="sm" color="gray.700" textAlign="center">
                        You can withdraw funds when the campaign deadline is
                        reached or the goal amount is met.
                      </Text>
                      <Box bg="gray.50" p={4} borderRadius="md">
                        <VStack align="start" spacing={2} fontSize="sm">
                          <Text>
                            Current: {campaign.raisedAmount} /{" "}
                            {campaign.goalAmount} VET
                          </Text>
                          <Text>{formatTimeRemaining()}</Text>
                        </VStack>
                      </Box>
                    </VStack>
                  )}

                  <Divider />

                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      Creator Info:
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      📊 {campaign.donorCount} donors
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      💰 {calculateProgress().toFixed(0)}% funded
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      🔗 Campaign #{campaign.id}
                    </Text>
                  </VStack>
                </VStack>
              ) : campaign.fundsWithdrawn ? (
                // Show closed message if funds have been withdrawn
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Campaign Closed</Heading>

                  <VStack spacing={4}>
                    <Badge colorScheme="green" fontSize="lg" p={3}>
                      ✅ Funds Withdrawn
                    </Badge>
                    <Text fontSize="sm" color="gray.700" textAlign="center">
                      This campaign has been completed and the funds have been
                      withdrawn by the creator.
                    </Text>
                  </VStack>

                  <Divider />

                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      Campaign Results:
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      💰 Raised: {campaign.raisedAmount} VET
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      🎯 Goal: {campaign.goalAmount} VET
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      👥 {campaign.donorCount} donors
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      📊 {calculateProgress().toFixed(0)}% funded
                    </Text>
                  </VStack>

                  <Button
                    variant="outline"
                    colorScheme="primary"
                    onClick={() => navigate("/campaigns")}
                  >
                    Browse Other Campaigns
                  </Button>
                </VStack>
              ) : (
                // Original donation interface for non-creators
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Support This Campaign</Heading>

                  <VStack spacing={4} align="stretch">
                    <Input
                      type="number"
                      placeholder="Enter amount in VET"
                      size="lg"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />

                    <Button
                      colorScheme="primary"
                      size="lg"
                      onClick={handleDonate}
                      isLoading={donating}
                      loadingText="Processing..."
                      isDisabled={!account}
                    >
                      {account ? "Donate Now" : "Connect Wallet"}
                    </Button>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      You'll earn B3tr tokens for your donation!
                    </Text>
                  </VStack>

                  <Divider />

                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      Why Donate?
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      ✅ AI-verified medical need
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      💰 Funds held in escrow
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      🪙 Earn B3tr token rewards
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      🔗 Blockchain transparency
                    </Text>
                  </VStack>
                </VStack>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};
