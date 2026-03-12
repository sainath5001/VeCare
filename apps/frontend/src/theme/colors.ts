// Professional, neutral-first color system with a crisp blue primary and green accent
export const primary = {
  50: "#E8F0FF",
  100: "#C6D8FF",
  200: "#9DBBFF",
  300: "#74A0FF",
  400: "#4A85FF",
  500: "#1F6BFF",
  600: "#1554DB",
  700: "#0E3FB4",
  800: "#082B8C",
  900: "#041865",
};

export const secondary = {
  50: "#E8F9ED",
  100: "#CFF1DB",
  200: "#B6E9C8",
  300: "#91DDAA",
  400: "#5ECF7F",
  500: "#36B85C",
  600: "#2B9448",
  700: "#206D34",
  800: "#14471F",
  900: "#09260E",
};

export const gray = {
  50: "#F7F7F7",
  100: "#EFEFEF",
  200: "#E2E2E2",
  300: "#CFCFCF",
  400: "#BDBDBD",
  500: "#9E9E9E",
  600: "#7E7E7E",
  700: "#5F5F5F",
  800: "#3F3F3F",
  900: "#202020",
};

export const social = {
  discord: "#5865F2",
  discordHover: "#3F4B9C",
  telegram: "#27A6E7",
  telegramHover: "#0088CC",
};

export const lightThemeColors = {
  primary,
  secondary,
  gray,
  social,
  // keep an alias for backwards compatibility if anything imported `green` previously
  green: secondary,
};
