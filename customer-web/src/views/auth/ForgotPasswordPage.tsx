import { useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      {!isSent ? (
        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" fontWeight={700} mb={1}>Reset Password</Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3} mb={5}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Stack>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.8, fontSize: "1.1rem" }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>

          <Box sx={{ mt: 5, textAlign: "center" }}>
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              &larr; Back to Sign In
            </Typography>
          </Box>
        </motion.div>
      ) : (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" fontWeight={700} mb={2}>Check your email</Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            We've sent password reset instructions to <strong>{email}</strong>.
          </Typography>
          
          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            sx={{ py: 1.8 }}
          >
            Return to Sign In
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
