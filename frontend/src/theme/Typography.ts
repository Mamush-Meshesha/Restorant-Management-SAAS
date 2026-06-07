const typography = {
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
    fontSize: "0.875rem", // 14px is standard for dense enterprise UIs
    fontWeight: 400,
    lineHeight: "1.25rem",
  },
  body2: {
    fontSize: "0.8125rem", // 13px for secondary text
    letterSpacing: "0rem",
    fontWeight: 400,
    lineHeight: "1.25rem",
  },
  subtitle1: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
};

export default typography;
