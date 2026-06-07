import { loginUser } from "@/api/_auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/widgets/CustomInput";
import { useAppDispatch } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { loginFinished } from "@/redux/slices/authSlice";
import { ROLE_DEFAULT_PATHS } from "@/config/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
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
            <h1 className="text-4xl font-bold leading-tight">Welcome to Restaurant POS</h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              Your comprehensive Restaurant Management Platform. Manage orders,
              staff, and kitchen operations with ease.
            </p>
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Point of Sale &amp; Orders</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Kitchen Display System</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm">Inventory &amp; Financial Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Restaurant POS</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      setLoading(true);
      const { data } = await loginUser({ email, password });
      if (data.token) {
        dispatch(loginFinished(data));
        const roleName = data.user?.role?.name || (data.user?.role as any)?.role_name || "";
        const redirectPath = ROLE_DEFAULT_PATHS[roleName] ?? "/dashboard";
        navigate(redirectPath, { replace: true });
      } else {
        toast.error("Login failed. Please try again.");
      }
      reset();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "An error occurred during login!");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Enter your credentials to access your dashboard
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormInput
                label="Email"
                name="email"
                control={control}
                placeholder="admin@restaurant.com"
                type="email"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-purple-600 transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormInput
                  label=""
                  name="password"
                  control={control}
                  placeholder="Enter your password"
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline">
                  Contact Administrator
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>© 2024 Restaurant POS Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
