import { HStack, Image, Text, Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

type LogoVariant = "nav" | "footer";

interface LogoProps {
  variant?: LogoVariant;
  to?: string;
}

export const Logo = ({ variant = "nav", to = "/" }: LogoProps) => {
  // Image sizing tuned per context
  const imgSizes =
    variant === "nav"
      ? { h: { base: 10, md: 12 }, w: "auto" as const }
      : { h: { base: 14, md: 18, lg: 20 }, w: "auto" as const };
  const textSize =
    variant === "nav"
      ? { base: "xl", md: "2xl" }
      : { base: "3xl", md: "4xl", lg: "5xl" };
  const textColor = variant === "footer" ? "white" : "blackAlpha.900";
  const spacing = variant === "nav" ? 2 : 3;

  const content = (
    <HStack align="center" spacing={spacing}>
  <Image src="/logo.png" alt="VeCare logo" {...imgSizes} objectFit="contain" />
      <Text fontSize={textSize} fontWeight={900} letterSpacing="-0.02em" color={textColor}>
        VeCare
      </Text>
    </HStack>
  );

  return (
    <ChakraLink as={RouterLink} to={to} _hover={{ textDecoration: "none" }}>
      {content}
    </ChakraLink>
  );
};
