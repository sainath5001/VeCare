import {
  StyleFunctionProps,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";
import { cardAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

// define custom styles for funky variant
const variants = {
  base: (props: StyleFunctionProps) =>
    definePartsStyle({
      container: {
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
        borderWidth: "1px",
        borderColor: props.colorMode === "dark" ? "gray.700" : "transparent",
      },
    }),
  filled: (props: StyleFunctionProps) =>
    definePartsStyle({
      container: {
        bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
      },
    }),
  baseWithBorder: (props: StyleFunctionProps) =>
    definePartsStyle({
      container: {
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
        borderWidth: "1px",
        borderColor: props.colorMode === "dark" ? "gray.700" : "gray.100",
      },
    }),
  secondaryBoxShadow: (props: StyleFunctionProps) =>
    definePartsStyle({
      container: {
        boxShadow: "inset 0px 0px 60px 3px rgba(100,159,79,0.12)",
        bg: props.colorMode === "dark" ? "gray.800" : "gray.50",
        borderWidth: "1px",
        borderColor: props.colorMode === "dark" ? "gray.700" : "gray.100",
      },
    }),
};

// export variants in the component theme
export const cardTheme = defineMultiStyleConfig({
  variants,
  defaultProps: {
    variant: "base", // default is solid
  },
});
