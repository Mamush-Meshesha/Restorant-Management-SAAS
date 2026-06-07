import { CircularProgress, Box } from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  size = 40,
  message = "Loading...",
  fullHeight = false,
}: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={fullHeight ? "400px" : "200px"}
      gap={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Box
          component="p"
          sx={{
            color: "#64748b",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
}
