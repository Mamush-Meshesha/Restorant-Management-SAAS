export const createTypography = (fontSizeScale: "small" | "medium" | "large" = "medium") => {
  const scale = fontSizeScale === "small" ? 0.9 : fontSizeScale === "large" ? 1.1 : 1;
  const rem = (val: number) => `${val * scale}rem`;

  return {
  fontFamily: "'Plus Jakarta Sans', sans-serif;",
  h1: {
    fontWeight: 700,
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
    letterSpacing: "-0.02em",
    fontFamily: "'Plus Jakarta Sans', sans-serif;",
  },
  h2: {
    fontWeight: 700,
    fontSize: "1.875rem",
    lineHeight: "2.25rem",
    letterSpacing: "-0.01em",
    fontFamily: "'Plus Jakarta Sans', sans-serif;",
  },
  h3: {
    fontWeight: 600,
    fontSize: "1.5rem",
    lineHeight: "2rem",
    letterSpacing: "-0.01em",
    fontFamily: "'Plus Jakarta Sans', sans-serif;",
  },
  h4: {
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    letterSpacing: "-0.01em",
  },
  h5: {
    fontWeight: 600,
    fontSize: "1rem",
    lineHeight: "1.5rem",
  },
  h6: {
    fontWeight: 600,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  button: {
    textTransform: "none" as const, // Enterprise buttons are typically not all caps/capitalize
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
    body1: {
      fontSize: rem(0.875), // 14px
      fontWeight: 400,
      lineHeight: rem(1.25),
    },
    body2: {
      fontSize: rem(0.8125), // 13px
      letterSpacing: "0rem",
      fontWeight: 400,
      lineHeight: rem(1.25),
    },
    subtitle1: {
      fontSize: rem(0.875),
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: rem(0.8125),
      fontWeight: 500,
    },
  };
};

export default createTypography("medium");
