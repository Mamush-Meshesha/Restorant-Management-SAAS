import { useState } from "react";
import { Box, Typography, TextField, Button, Stack } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    }, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      {!isSuccess ? (
        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" fontWeight={700} mb={1}>Create New Password</Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            Your new password must be different from previous used passwords.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3} mb={5}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Stack>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={isLoading || password !== confirmPassword || password.length < 8}
              sx={{ py: 1.8, fontSize: "1.1rem" }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        </motion.div>
      ) : (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" fontWeight={700} mb={2}>Password Reset</Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            Your password has been successfully reset. Redirecting you to sign in...
          </Typography>
          
          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ py: 1.8 }}
          >
            Sign In Now
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
