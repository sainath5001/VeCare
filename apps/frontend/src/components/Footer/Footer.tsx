"use client";
import {
  VStack,
  Text,
  Container,
  HStack,
  Box,
  Show,
  Link,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";

import { Logo } from "../Logo";

export const Footer: React.FC = () => {
  const desktopContent = (
    <Flex direction="row" align="stretch" justify="space-between" py={10} gap={8}>
      {/* Left: Logo + brand + legal links */}
      <VStack align="start" spacing={6} flex="1">
        <Logo variant="footer" />
        <Text
          fontWeight={400}
          fontSize="14px"
          lineHeight="17px"
          color={useColorModeValue("whiteAlpha.900", "whiteAlpha.900")}
        >
          2025 VeCare. All rights reserved.
        </Text>
      </VStack>

      {/* Right: CTA */}
      <VStack align="end" spacing={4} flex="1" textAlign="right">
        <Text fontSize="2xl" fontWeight="bold">Ready to make an impact?</Text>
        <Text fontSize="md" color={useColorModeValue("whiteAlpha.900", "whiteAlpha.900")} maxW="lg">
          Support a verified campaign or start your own in minutes.
        </Text>
        <HStack spacing={3} justify="flex-end">
          <Link href="/campaigns">
            <Box as="button" px={5} py={3} bg="white" color="primary.700" borderRadius="md" _hover={{ bg: "whiteAlpha.900" }}>
              Explore Campaigns
            </Box>
          </Link>
          <Link href="/create">
            <Box as="button" px={5} py={3} borderWidth="1px" borderColor="whiteAlpha.600" color="white" borderRadius="md" _hover={{ bg: "whiteAlpha.200" }}>
              Create a Campaign
            </Box>
          </Link>
        </HStack>
      </VStack>
    </Flex>
  );

  const mobileContent = (
      <VStack spacing={8} py={10}>
      <VStack spacing={4}>
        <Logo variant="footer" />
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">Ready to make an impact?</Text>
        <Text fontSize="md" color={useColorModeValue("whiteAlpha.900", "whiteAlpha.900")} textAlign="center" maxW="xs">
          Support a verified campaign or start your own in minutes.
        </Text>
        <HStack spacing={3}>
          <Link href="/campaigns">
            <Box as="button" px={5} py={3} bg="white" color="primary.700" borderRadius="md" _hover={{ bg: "whiteAlpha.900" }}>
              Explore
            </Box>
          </Link>
          <Link href="/create">
            <Box as="button" px={5} py={3} borderWidth="1px" borderColor="whiteAlpha.600" color="white" borderRadius="md" _hover={{ bg: "whiteAlpha.200" }}>
              Create
            </Box>
          </Link>
        </HStack>
      </VStack>
      <VStack spacing={3}>
        <Text
          fontWeight={400}
          fontSize="14px"
          lineHeight="17px"
          color={useColorModeValue("whiteAlpha.900", "whiteAlpha.900")}
        >
          2025 VeCare. All rights reserved.
        </Text>
      </VStack>
    </VStack>
  );

  return (
    <Flex
      bgGradient={useColorModeValue(
        "linear(to-r, primary.600, primary.500)",
        "linear(to-r, primary.700, primary.600)"
      )}
      color="white"
    >
      <Container
        maxW={"container.xl"}
        display={"flex"}
        alignItems={"stretch"}
        justifyContent={"flex-start"}
        flexDirection={"column"}
        px={{ base: 4, md: 8 }}
      >
        <Show above="md">{desktopContent}</Show>
        <Show below="md">{mobileContent}</Show>
      </Container>
    </Flex>
  );
};
