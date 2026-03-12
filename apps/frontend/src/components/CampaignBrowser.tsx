import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Progress,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet, useConnex } from "@vechain/dapp-kit-react";
import { FaCheckCircle, FaHeart } from "react-icons/fa";
import { API_ENDPOINTS } from "../config/api";
import { config, VECARE_SOL_ABI } from "@repo/config-contract";
import { unitsUtils } from "@vechain/sdk-core";

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
}

/** Mock campaigns for development when API/chain returns empty – so you can see how the list looks */
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Medical Fund for Treatment",
    description: "My name is Sarah and I need help with cancer treatment. The doctors have recommended a course of chemotherapy and surgery. My family cannot afford the full cost. Any support would mean a lot. Thank you for considering my campaign.",
    goalAmount: "1000",
    raisedAmount: "320",
    deadline: Math.floor(Date.now() / 1000) + 30 * 86400,
    isVerified: true,
    donorCount: 8,
  },
  {
    id: 2,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Child's Heart Surgery",
    description: "Our 5-year-old needs urgent heart surgery. The medical team has given us a window of 3 months. We have already sold our car and need your help to cover the remaining hospital and recovery costs.",
    goalAmount: "8000",
    raisedAmount: "3400",
    deadline: Math.floor(Date.now() / 1000) + 45 * 86400,
    isVerified: true,
    donorCount: 28,
  },
  {
    id: 3,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Rare Disease Medication Fund",
    description: "Living with a rare disease means expensive monthly medication that insurance does not fully cover. This campaign will help cover one year of treatment so I can keep working and supporting my family.",
    goalAmount: "3000",
    raisedAmount: "2100",
    deadline: Math.floor(Date.now() / 1000) + 10 * 86400,
    isVerified: true,
    donorCount: 45,
  },
  {
    id: 4,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Recovery After Serious Accident",
    description: "I was in a car accident and need multiple surgeries and months of physiotherapy. My family cannot afford the full cost. Your donation will help me get back on my feet and return to work. Thank you for your kindness.",
    goalAmount: "6500",
    raisedAmount: "2800",
    deadline: Math.floor(Date.now() / 1000) + 18 * 86400,
    isVerified: true,
    donorCount: 34,
  },
  {
    id: 5,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Diabetes Supplies for a Year",
    description: "Managing type 1 diabetes requires constant supplies: insulin, test strips, and a pump. Insurance covers only part of it. This campaign will fund one year of supplies so I can stay healthy and continue caring for my children.",
    goalAmount: "4200",
    raisedAmount: "1900",
    deadline: Math.floor(Date.now() / 1000) + 32 * 86400,
    isVerified: true,
    donorCount: 22,
  },
  {
    id: 6,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Kidney Transplant Support",
    description: "After years on dialysis, I have been approved for a kidney transplant. The surgery and aftercare are costly. Your support will help cover medications and follow-up care so I can recover and return to a normal life.",
    goalAmount: "7500",
    raisedAmount: "4100",
    deadline: Math.floor(Date.now() / 1000) + 22 * 86400,
    isVerified: true,
    donorCount: 56,
  },
  {
    id: 7,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Spinal Surgery for Mobility",
    description: "A spinal condition has left me in constant pain and unable to work. Surgery could restore my mobility. I have saved what I can but still need help with the remaining hospital and rehabilitation expenses.",
    goalAmount: "5500",
    raisedAmount: "1800",
    deadline: Math.floor(Date.now() / 1000) + 40 * 86400,
    isVerified: true,
    donorCount: 19,
  },
  {
    id: 8,
    creator: "0x0000000000000000000000000000000000000000",
    title: "Emergency Surgery for Our Father",
    description: "Our father needs urgent surgery to remove a tumour. We are doing everything we can as a family but the bills are overwhelming. Every contribution brings us closer to giving him the care he deserves.",
    goalAmount: "9200",
    raisedAmount: "5200",
    deadline: Math.floor(Date.now() / 1000) + 14 * 86400,
    isVerified: true,
    donorCount: 72,
  },
];

type AbiItem = { type?: string; name?: string };
const ABI = VECARE_SOL_ABI as readonly AbiItem[];

export const CampaignBrowser: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account } = useWallet();
  const connex = useConnex();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "my">(() => {
    const params = new URLSearchParams(location.search);
    return params.get("filter") === "my" ? "my" : "all";
  });

  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (filter === "my") params.set("filter", "my");
    else params.delete("filter");
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [filter, location.pathname, location.search]);

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, account, connex]);

  const fetchFromChain = async (): Promise<Campaign[]> => {
    if (!connex) return [];
    const addr = config.VECARE_CONTRACT_ADDRESS;
    const counterAbi = ABI.find((x) => x.name === "campaignCounter" && x.type === "function");
    const getCampaignAbi = ABI.find((x) => x.name === "getCampaign" && x.type === "function");
    if (!counterAbi || !getCampaignAbi) return [];
    try {
      const counterRes = await connex.thor.account(addr).method(counterAbi as object).call();
      const dec = counterRes.decoded as Record<string, unknown> | unknown[] | undefined;
      let total = 0;
      if (Array.isArray(dec) && dec.length > 0) total = Number(dec[0]);
      else if (dec && typeof dec === "object" && "0" in dec) total = Number((dec as Record<string, unknown>)["0"]);
      else if (dec && typeof dec === "object") total = Number(Object.values(dec)[0]);
      if (!Number.isFinite(total) || total < 1) return [];
      const list: Campaign[] = [];
      const now = Math.floor(Date.now() / 1000);
      for (let id = 1; id <= Math.min(total, 50); id++) {
        try {
          const res = await connex.thor.account(addr).method(getCampaignAbi as object).call(id);
          const out = res.decoded as Record<string, unknown> | unknown[] | undefined;
          // Connex can return: struct object, { "0": struct }, or tuple as array [id, creator, title, ...]
          let d = (Array.isArray(out) ? out[0] : out?.["0"]) as Record<string, unknown> | undefined;
          if (!d && out && typeof out === "object" && !Array.isArray(out) && "id" in out) {
            d = out as Record<string, unknown>;
          }
          // Struct decoded as flat array: [id, creator, title, description, docHash, goalAmount, raisedAmount, deadline, isActive, isVerified, fundsWithdrawn, createdAt, donorCount]
          const arr = Array.isArray(out) && out.length >= 13 ? (out as unknown[]) : null;
          const c: Campaign | null = arr
            ? {
                id: Number(arr[0] ?? id),
                creator: String(arr[1] ?? ""),
                title: String(arr[2] ?? ""),
                description: String(arr[3] ?? ""),
                goalAmount: unitsUtils.formatUnits(BigInt(String(arr[5] ?? 0)), "ether"),
                raisedAmount: unitsUtils.formatUnits(BigInt(String(arr[6] ?? 0)), "ether"),
                deadline: Number(arr[7] ?? 0),
                isVerified: Boolean(arr[9]),
                donorCount: Number(arr[12] ?? 0),
              }
            : d
              ? {
                  id: Number(d.id ?? id),
                  creator: String(d.creator ?? ""),
                  title: String(d.title ?? ""),
                  description: String(d.description ?? ""),
                  goalAmount: unitsUtils.formatUnits(BigInt(String(d.goalAmount ?? 0)), "ether"),
                  raisedAmount: unitsUtils.formatUnits(BigInt(String(d.raisedAmount ?? 0)), "ether"),
                  deadline: Number(d.deadline ?? 0),
                  isVerified: Boolean(d.isVerified),
                  donorCount: Number(d.donorCount ?? 0),
                }
              : null;
          if (!c) continue;
          // My campaigns: show ALL your campaigns (active + past). All: show only active verified.
          if (filter === "all") {
            if (c.isVerified && c.deadline > now) list.push(c);
          } else {
            if (account && c.creator?.toLowerCase() === account.toLowerCase()) list.push(c);
          }
        } catch {
          // skip failed campaign
        }
      }
      return list;
    } catch {
      return [];
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      if (filter === "my" && !account) {
        setCampaigns([]);
        return;
      }
      // My campaigns: when wallet is connected, read from chain so we always show your campaigns (including past)
      if (filter === "my" && connex && account) {
        const list = await fetchFromChain();
        if (import.meta.env.DEV && list.length === 0) {
          console.log("[VeCare] My campaigns: fetched from chain, count =", list.length, "- ensure wallet is on same network as your campaign (e.g. Testnet)");
        }
        setCampaigns(list);
        return;
      }
      // All campaigns: try API first, then chain fallback
      const apiUrl = filter === "my" ? API_ENDPOINTS.campaigns : API_ENDPOINTS.activeVerified;
      const resp = await fetch(apiUrl);
      const data = await resp.json();
      let list: Campaign[] = (data.success && data.data) ? data.data : [];
      if (list.length === 0 && connex) {
        list = await fetchFromChain();
      }
      setCampaigns(list);
    } catch (err) {
      if (connex && account && filter === "my") {
        try {
          const list = await fetchFromChain();
          setCampaigns(list);
        } catch {
          setCampaigns([]);
        }
      } else if (connex) {
        try {
          const list = await fetchFromChain();
          setCampaigns(list);
        } catch {
          setCampaigns([]);
        }
      } else {
        console.error("Error fetching campaigns", err);
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (raised: string, goal: string) => {
    const raisedNum = parseFloat(raised) || 0;
    const goalNum = parseFloat(goal) || 0;
    return goalNum ? (raisedNum / goalNum) * 100 : 0;
  };

  const formatTimeRemaining = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    const days = Math.floor(remaining / 86400);
    if (days > 0) return `${days} days left`;
    const hours = Math.floor(remaining / 3600);
    if (hours > 0) return `${hours} hours left`;
    return "Ending soon";
  };

  if (loading) {
    return (
      <Box bg="white" pt={{ base: 24, md: 28 }} pb={12}>
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="primary.500" thickness="4px" />
            <Text>Loading campaigns...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Show mock campaigns when list is empty (dev or clone) so the UI always has sample data
  const showMockWhenEmpty = campaigns.length === 0;
  const mockForDisplay =
    filter === "my" && account
      ? MOCK_CAMPAIGNS.map((c) => ({ ...c, creator: account }))
      : filter === "my"
        ? []
        : MOCK_CAMPAIGNS;
  const displayList = showMockWhenEmpty
    ? mockForDisplay
    : filter === "my" && account
      ? campaigns.filter((c) => c.creator?.toLowerCase() === account?.toLowerCase())
      : campaigns;

  return (
    <Box pt={{ base: 24, md: 28 }} pb={12} bg="white">
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl">Active Medical Campaigns</Heading>
            <Text fontSize="lg" color="gray.700" maxW="2xl">
              {filter === "my"
                ? "Your campaigns (ongoing and past)"
                : "All campaigns are AI-verified for authenticity. Your donation goes directly to those in need and earns you B3tr tokens."}
            </Text>
          </VStack>

          <HStack justify="center">
            <Button variant={filter === "all" ? "solid" : "ghost"} onClick={() => setFilter("all")}>
              All campaigns
            </Button>
            <Button variant={filter === "my" ? "solid" : "ghost"} onClick={() => setFilter("my")}>
              My campaigns
            </Button>
          </HStack>

          {displayList.length === 0 ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Icon as={FaHeart} w={16} h={16} color="gray.700" />
                <Text fontSize="xl" color="gray.700">
                  No campaigns found
                </Text>
                <Button colorScheme="primary" onClick={() => navigate("/create")}>
                  Create the First Campaign
                </Button>
              </VStack>
            </Center>
          ) : (
            <>
              {showMockWhenEmpty && (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  Sample data for demo — real campaigns will appear when the app is connected to the chain.
                </Text>
              )}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {displayList.map((campaign) => (
                <Box
                  key={campaign.id}
                  bg={cardBg}
                  borderRadius="xl"
                  shadow="lg"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                  cursor="pointer"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  <Box p={6}>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
                          <Icon as={FaCheckCircle} />
                          AI Verified
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          {formatTimeRemaining(campaign.deadline)}
                        </Text>
                      </HStack>

                      <Heading size="md" noOfLines={2}>
                        {campaign.title}
                      </Heading>

                      <Text color="muted-text" noOfLines={3} fontSize="sm">
                        {campaign.description}
                      </Text>

                      <VStack align="stretch" spacing={2}>
                        <Progress
                          value={calculateProgress(campaign.raisedAmount, campaign.goalAmount)}
                          colorScheme="primary"
                          borderRadius="full"
                          size="sm"
                        />

                        <HStack justify="space-between" fontSize="sm">
                          <Text fontWeight="bold" color="primary.600">
                            {campaign.raisedAmount} VET raised
                          </Text>
                          <Text color="gray.500">of {campaign.goalAmount} VET</Text>
                        </HStack>
                      </VStack>

                      <HStack justify="space-between" pt={2}>
                        <Text fontSize="sm" color="gray.600">
                          {campaign.donorCount} donors
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/campaigns/${campaign.id}`);
                          }}
                        >
                          Donate Now
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
