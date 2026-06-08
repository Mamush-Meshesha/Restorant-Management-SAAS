import { useState } from "react";
import { Box, Typography, TextField, Button, Stack, Checkbox, FormControlLabel, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loginApi } from "../../api/auth";
import { useAppDispatch } from "../../redux/hooks";
import { loginSuccess } from "../../redux/slices/userSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginApi({ email, password });
      dispatch(
        loginSuccess({
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
        })
      );
      navigate("/account");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h3" fontWeight={700} mb={1}>Welcome Back</Typography>
      <Typography variant="body1" color="text.secondary" mb={5}>
        Sign in to manage your reservations and view your exclusive loyalty rewards.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3} mb={3}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
          />
          <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            color="secondary.dark"
            fontWeight={600}
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Forgot Password?
          </Typography>
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
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </Box>

      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Typography
            component={Link}
            to="/register"
            variant="body2"
            color="secondary.dark"
            fontWeight={700}
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Create an Account
          </Typography>
        </Typography>
      </Box>
    </motion.div>
  );
}
