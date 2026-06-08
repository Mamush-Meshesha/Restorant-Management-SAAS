import { useState } from "react";
import { Box, Typography, TextField, Button, Stack, Checkbox, FormControlLabel, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { registerApi } from "../../api/auth";
import { useAppDispatch } from "../../redux/hooks";
import { loginSuccess } from "../../redux/slices/userSlice";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const parts = formData.name.trim().split(" ");
      const first_name = parts[0];
      const last_name = parts.length > 1 ? parts.slice(1).join(" ") : "Customer";

      const data = await registerApi({
        first_name,
        last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      dispatch(
        loginSuccess({
          token: data.token,
          refreshToken: data.refreshToken,
          user: data.user,
        })
      );
      navigate("/account");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Typography variant="h3" fontWeight={700} mb={1}>Join RÉSERVER</Typography>
      <Typography variant="body1" color="text.secondary" mb={5}>
        Create an account to access premium dining features and begin earning loyalty points.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3} mb={3}>
          <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <TextField fullWidth label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <TextField fullWidth label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
          <TextField fullWidth label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </Stack>

        <FormControlLabel
          control={<Checkbox size="small" required />}
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the <Link to="/terms" style={{ color: "inherit" }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: "inherit" }}>Privacy Policy</Link>.
            </Typography>
          }
          sx={{ mb: 4 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          size="large"
          disabled={isLoading}
          sx={{ py: 1.8, fontSize: "1.1rem" }}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </Box>

      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            color="secondary.dark"
            fontWeight={700}
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Sign In
          </Typography>
        </Typography>
      </Box>
    </motion.div>
  );
}
