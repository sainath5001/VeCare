import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  // useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@vechain/dapp-kit-react";
import { FaTrophy, FaHeart, FaCheckCircle, FaStar } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";

interface CreatorProfile {
  totalCampaigns: number;
  successfulCampaigns: number;
  totalRaised: string;
  trustScore: number;
  exists: boolean;
}

export const CreatorDashboard = () => {
  const navigate = useNavigate();
  // const toast = useToast();
  const { account } = useWallet();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue("white", "gray.800");

  const fetchProfile = useCallback(async () => {
    try {
      if (!account) return;
      const response = await fetch(API_ENDPOINTS.creators(account));
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [account, fetchProfile]);

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "orange";
    return "red";
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Building";
  };

  if (!account) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Icon as={FaHeart} w={16} h={16} color="gray.300" />
          <Text fontSize="xl" color="gray.500">
            Please connect your wallet to view your dashboard
          </Text>
        </VStack>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.500" thickness="4px" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Center>
    );
  }

  if (!profile || !profile.exists) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Icon as={FaHeart} w={16} h={16} color="gray.300" />
          <Text fontSize="xl" color="gray.500">
            You haven't created any campaigns yet
          </Text>
          <Button colorScheme="primary" onClick={() => navigate("/create") }>
            Create Your First Campaign
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box py={12}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="start">
            <Heading size="2xl">Creator Dashboard</Heading>
            <Text fontSize="lg" color="muted-text">
              Track your campaigns and build your reputation on VeCare Chain
            </Text>
          </VStack>

          {/* Trust Score Card */}
          <Box bg={cardBg} p={8} borderRadius="xl" shadow="lg">
            <VStack spacing={6}>
              <HStack spacing={4} w="full" justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="muted-text">
                    Your Trust Score
                  </Text>
                  <HStack>
                    <Heading size="3xl" color={`${getTrustScoreColor(profile.trustScore)}.500`}>
                      {profile.trustScore}
                    </Heading>
                    <Text fontSize="2xl" color="gray.400">
                      / 100
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme={getTrustScoreColor(profile.trustScore)}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    {getTrustScoreLabel(profile.trustScore)}
                  </Badge>
                </VStack>
                <Icon
                  as={FaStar}
                  w={20}
                  h={20}
                  color={`${getTrustScoreColor(profile.trustScore)}.500`}
                />
              </HStack>

              <Box w="full">
                <Text fontSize="sm" color="muted-text" mb={2}>
                  How to improve your trust score:
                </Text>
                <VStack align="start" spacing={1} fontSize="sm">
                  <Text>✅ Post regular campaign updates</Text>
                  <Text>✅ Successfully complete campaigns</Text>
                  <Text>✅ Maintain transparent communication</Text>
                  <Text>✅ Withdraw funds responsibly</Text>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg">
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FaCheckCircle} color="primary.500" />
                    <Text>Total Campaigns</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="4xl" color="primary.600">
                  {profile.totalCampaigns}
                </StatNumber>
                <StatHelpText>campaigns created</StatHelpText>
              </Stat>
            </Box>

            <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg">
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FaTrophy} color="green.500" />
                    <Text>Successful</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="4xl" color="green.600">
                  {profile.successfulCampaigns}
                </StatNumber>
                <StatHelpText>goals reached</StatHelpText>
              </Stat>
            </Box>

            <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg">
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={FaHeart} color="red.500" />
                    <Text>Total Raised</Text>
                  </HStack>
                </StatLabel>
                <StatNumber fontSize="4xl" color="red.600">
                  {parseFloat(profile.totalRaised).toFixed(2)}
                </StatNumber>
                <StatHelpText>VET raised</StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>

          {/* Actions */}
          <HStack spacing={4}>
            <Button
              colorScheme="primary"
              size="lg"
              onClick={() => navigate("/create")}
            >
              Create New Campaign
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/campaigns")}
            >
              Browse Campaigns
            </Button>
          </HStack>

          {/* Success Rate */}
          {profile.totalCampaigns > 0 && (
            <Box bg={cardBg} p={6} borderRadius="xl" shadow="lg">
              <VStack align="start" spacing={4}>
                <Heading size="md">Success Rate</Heading>
                <HStack w="full" justify="space-between">
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {((profile.successfulCampaigns / profile.totalCampaigns) * 100).toFixed(0)}%
                  </Text>
                  <Text color="muted-text">
                    {profile.successfulCampaigns} of {profile.totalCampaigns} campaigns reached their goal
                  </Text>
                </HStack>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
