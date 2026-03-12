import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
  useColorModeValue,
  Badge,
  Image,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaShieldAlt, FaGlobe, FaCoins, FaUsers, FaCheckCircle } from "react-icons/fa";

export const HomePage = () => {
  const navigate = useNavigate();
  const lottieContainerRef = useRef<HTMLDivElement | null>(null);
  const lottieInstanceRef = useRef<AnimationItem | null>(null);

  // Colors and backgrounds tuned for a flat, colorful look
  const sectionBg = useColorModeValue("white", "gray.900");
  const softText = useColorModeValue("gray.700", "gray.200");
  const cardBg = useColorModeValue("white", "gray.800");

  // removed old 'steps' card grid in favor of visual vertical list

  const benefits = [
    {
      icon: FaUsers,
      title: "Verified Campaigns",
      description:
        "All campaigns are AI-verified for authenticity.",
      color: "teal.500",
    },
    {
      icon: FaGlobe,
      title: "On-Chain Transparency",
      description:
        "All key actions are recorded on VeChain for open verification.",
      color: "blue.500",
    },
    {
      icon: FaHeartbeat,
      title: "Impact First",
      description:
        "Fast routing of support where it’s needed—medical care without friction.",
      color: "red.500",
    },
    {
      icon: FaCoins,
      title: "B3tr Rewards",
      description:
        "Contribute and earn B3tr tokens that recognize your support.",
      color: "orange.500",
    },
  ];

  // 'How it works' content with images in a specific order
  const howItWorks = [
    {
      key: "submit",
      title: "Submit & Review",
      description:
        "Creators submit medical details. The submissions are verified via AI.",
      image: "/hero/submit.svg",
    },
    {
      key: "onchain",
      title: "On-chain Transparency",
      description:
        "Evidence is checked and tracked on-chain for auditability. No hype. Just clarity.",
      image: "/hero/on-chain.svg",
    },
    {
      key: "direct",
      title: "Direct Payouts",
      description:
        "Funds go straight to recipients’ wallets for timely access to care.",
      image: "/hero/direct.svg",
    },
  ];

  // Load Lottie animation for hero visual
  useEffect(() => {
    if (!lottieContainerRef.current) return;
    try {
      lottieInstanceRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/lottie/heartbeat.json",
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
        },
      });
      lottie.setSpeed(1);
    } catch (e) {
      // no-op: if asset missing, avoid crashing the page
      // console.warn("Lottie failed to load:", e);
    }
    return () => {
      lottieInstanceRef.current?.destroy();
      lottieInstanceRef.current = null;
    };
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box
        bg="white"
        minH="calc(100vh - 64px)"
        display="flex"
        alignItems="center"
        pt={{ base: 16, md: 16 }}
        pb={0}
      >
        <Container maxW="container.xl" px={{ base: 4, md: 12 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 10 }} alignItems="center">
            {/* Left: copy + actions */}
            <VStack spacing={{ base: 5, md: 6 }} align="start" textAlign={{ base: "center", md: "left" }} px={{ base: 0, md: 4, lg: 8 }}>
              <Badge
                colorScheme="primary"
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
                variant="subtle"
                alignSelf={{ base: "center", md: "flex-start" }}
                display="inline-flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FaCheckCircle} />
                Verified Medical Crowdfunding
              </Badge>
              <Heading
                as="h1"
                size={{ base: "2xl", md: "3xl" }}
                fontWeight="800"
                letterSpacing="-0.02em"
                bgGradient="linear(to-r, primary.700, primary.500)"
                bgClip="text"
              >
                Verified care, direct impact
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color={softText} maxW="3xl">
                Trusted medical crowdfunding with transparent verification and direct-to-recipient payouts.
              </Text>
              <HStack spacing={4} pt={1} justify={{ base: "center", md: "flex-start" }} w="full">
                <Button size="lg" colorScheme="primary" onClick={() => navigate("/campaigns")} px={8}>
                  Browse Campaigns
                </Button>
                <Button size="lg" variant="outline" colorScheme="primary" onClick={() => navigate("/create")} px={8}>
                  Start a Campaign
                </Button>
              </HStack>

              {/* Trust markers */}
              <HStack spacing={{ base: 2, md: 4 }} pt={{ base: 3, md: 4 }} flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                <Badge px={3} py={1.5} borderRadius="full" variant="outline" colorScheme="primary" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaShieldAlt} /> AI assisted
                </Badge>
                <Badge px={3} py={1.5} borderRadius="full" variant="outline" colorScheme="primary" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaGlobe} /> On-chain traceability
                </Badge>
                <Badge px={3} py={1.5} borderRadius="full" variant="outline" colorScheme="primary" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaCoins} /> Donor rewards
                </Badge>
              </HStack>
            </VStack>

            {/* Right: Lottie visual */}
            <Flex justify={{ base: "center", md: "flex-end" }}>
              <Box
                ref={lottieContainerRef}
                aria-label="VeCare heartbeat animation"
                w={{ base: "80%", md: "full" }}
                maxW={{ base: "360px", md: "520px" }}
                h={{ base: "280px", md: "400px" }}
              />
            </Flex>
          </SimpleGrid>
        </Container>
      </Box>

      {/* How it works */}
      <Box bg={sectionBg} py={{ base: 12, md: 16 }}>
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          <VStack spacing={{ base: 8, md: 10 }}>
            <VStack spacing={3} textAlign="center">
              <Heading size="xl" bgGradient="linear(to-r, primary.700, primary.500)" bgClip="text">How VeCare Works</Heading>
              <Text fontSize="lg" color={softText} maxW="2xl">
                A clear, transparent path from verification to impact.
              </Text>
            </VStack>

            <VStack spacing={6} w="full">
              {howItWorks.map((item) => (
                <Flex
                  key={item.key}
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "flex-start", md: "center" }}
                  gap={{ base: 4, md: 7 }}
                  p={{ base: 5, md: 6 }}
                  w="full"
                  maxW={{ base: "full", md: "900px" }}
                  mx="auto"
                >
                  <Box
                    flexShrink={0}
                    w={{ base: "100%", md: "auto" }}
                    display="flex"
                    justifyContent={{ base: "center", md: "flex-start" }}
                    px={{ base: 1, md: 2 }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      w={{ base: "70%", md: "220px" }}
                      maxH={{ base: "120px", md: "180px" }}
                      objectFit="contain"
                    />
                  </Box>
                  <VStack align="start" spacing={4} w={{ base: "100%", md: "auto" }} flex={1}>
                    <Heading size={{ base: "md", md: "lg" }}>{item.title}</Heading>
                    <Text color={softText} fontSize={{ base: "md", md: "lg" }}>{item.description}</Text>
                  </VStack>
                </Flex>
              ))}
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Benefits */}
      <Box
        bg={sectionBg}
        py={{ base: 12, md: 16 }}
      >
        <Container maxW="container.lg" px={{ base: 4, md: 8 }}>
          <VStack spacing={{ base: 8, md: 10 }}>
            <VStack spacing={3} textAlign="center">
              <Heading size="xl" bgGradient="linear(to-r, primary.700, primary.500)" bgClip="text">Why People Choose VeCare</Heading>
              <Text fontSize="lg" color={softText} maxW="2xl">
                Flat design, real transparency, and community-first incentives.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 8 }} w="full">
              {benefits.map((b, i) => (
                <Box
                  key={i}
                  borderRadius="2xl"
                  bg={cardBg}
                  px={{ base: 5, md: 8 }}
                  py={{ base: 5, md: 6 }}
                  minH={{ base: "auto", md: "120px" }}
                >
                  <Flex direction={{ base: "row", md: "row" }} align="center" gap={{ base: 4, md: 6 }}>
                    <Flex
                      w={12}
                      h={12}
                      align="center"
                      justify="center"
                      borderRadius="lg"
                      bg={`${b.color.split(".")[0]}.50`}
                      flexShrink={0}
                    >
                      <Icon as={b.icon} w={6} h={6} color={b.color} />
                    </Flex>
                    <Box flex="1">
                      <Heading size="md" mb={1}>{b.title}</Heading>
                      <Text color={softText}>{b.description}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Call to action moved into Footer for a unified band */}
    </Box>
  );
};
