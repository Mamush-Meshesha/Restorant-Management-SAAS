import { requestPasswordReset } from "@/api/_auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/widgets/CustomInput";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
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
            <h1 className="text-4xl font-bold leading-tight">Reset Password</h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Secure password reset</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Email verification required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Quick and easy process</span>
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
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              Enter your email to reset your password
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const email = watch("email");

  const onSubmit = async ({ email }: FormData) => {
    try {
      setLoading(true);

      await requestPasswordReset({ email });
      setEmailSent(true);
      toast.success("Password reset email sent successfully!");

      reset();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred while sending the reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={cn("space-y-6", className)} {...props}>
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Try another email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </Link>
            </div>
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
            Reset Password
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Enter your email address and we'll send you a reset link
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <FormInput
                  label="Email Address"
                  name="email"
                  control={control}
                  placeholder="Enter your email address"
                  type="email"
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
                  <span>Sending reset email...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Send Reset Email</span>
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
