import { resetPassword } from "@/api/_auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/widgets/CustomInput";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new password reset.");
    }
  }, [token, email]);

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Invalid Reset Link
              </h3>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md text-center space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Set New Password
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Create a strong password to secure your account.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">At least 8 characters</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Mix of letters and numbers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Secure and memorable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <img
                  src="/var1.png"
                  alt="Restaurant POS Logo"
                  className="h-8 w-8 text-white"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
                <Shield className="h-8 w-8 text-white hidden" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <ResetPasswordForm token={token} email={email} />
        </div>
      </div>
    </div>
  );
}

interface ResetPasswordFormProps {
  token: string;
  email: string;
  className?: string;
}

export function ResetPasswordForm({
  token,
  email,
  className,
  ...props
}: ResetPasswordFormProps & React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ newPassword }: FormData) => {
    try {
      setLoading(true);

      await resetPassword({
        email,
        newPassword,
        resetToken: token,
      });

      setPasswordReset(true);
      toast.success("Password reset successfully!");

      reset();
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred while resetting your password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className={cn("space-y-6", className)} {...props}>
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Password Reset Successful
              </h3>
              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
            </div>

            <Link to="/login">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Set New Password
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Create a strong password for your account
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormInput
                  label="New Password"
                  name="newPassword"
                  control={control}
                  placeholder="Enter your new password"
                  type={showPassword ? "text" : "password"}
                  endIcon={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  }
                />
              </div>

              <div className="space-y-2">
                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  control={control}
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                  endIcon={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
              disabled={loading}
              style={{
                background: loading
                  ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                boxShadow: loading
                  ? "0 4px 12px rgba(107, 114, 128, 0.3)"
                  : "0 4px 12px rgba(59, 130, 246, 0.3)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting password...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Reset Password</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>
          By using this service, you agree to our{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-purple-600 transition-colors duration-200 hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-600 hover:text-purple-600 transition-colors duration-200 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
        <p className="text-gray-400">© 2024 Restaurant POS Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
