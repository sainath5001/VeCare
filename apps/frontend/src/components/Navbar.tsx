import { Box, Container, HStack, Button, IconButton, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { Logo } from "./Logo";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { ConnectWalletButton } from "./ConnectWalletButton";
export const Navbar = () => {
  // Semi-transparent white navbar with blur
  const bg = "rgba(255, 255, 255, 0.8)";
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.300");
  const textColor = useColorModeValue("blackAlpha.900", "whiteAlpha.900");
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box
      px={0}
      position={"fixed"}
      top={0}
      zIndex={20}
      py={2}
      h={"64px"}
      w={"full"}
      bg={bg}
      color={textColor}
      backdropFilter="saturate(120%) blur(10px)"
      style={{ WebkitBackdropFilter: "saturate(120%) blur(10px)" }}
      borderBottomWidth={1}
      borderBottomColor={borderColor}
    >
      <Container
        w="full"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems={"center"}
        maxW={"7xl"}
        px={{ base: 4, md: 20 }}
      >
        <HStack flex={1} justifyContent={"start"} spacing={2}>
          <Logo variant="nav" />
        </HStack>

        <HStack flex={1} spacing={3} justifyContent={"end"}>
          {isMobile ? (
            <IconButton
              aria-label="Start a campaign"
              icon={<FaPlus />}
              onClick={() => navigate("/create")}
              colorScheme="primary"
              variant="solid"
            />
          ) : (
            <Button
              leftIcon={<FaPlus />}
              onClick={() => navigate("/create")}
              colorScheme="primary"
              variant="solid"
            >
              Start a Campaign
            </Button>
          )}
          <ConnectWalletButton />
        </HStack>
      </Container>
    </Box>
  );
};
