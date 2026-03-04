import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, Sparkles, Store, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { lovable } from "@/integrations/lovable/index";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  accountType: z.enum(["customer", "vendor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountType = "customer" | "vendor";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
  }>({});
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setErrors({ email: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const result = signUpSchema.safeParse({ name, email, password, confirmPassword, accountType });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, name, accountType);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        setErrors({ email: "This email is already registered. Try signing in instead." });
      } else {
        setErrors({ email: error.message });
      }
    } else {
      setShowVerification(true);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="glass-card p-8 space-y-4">
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                <h1 className="text-2xl font-heading font-bold">Check Your Email!</h1>
                <p className="text-muted-foreground">
                  We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button onClick={() => setShowVerification(false)} className="text-primary hover:underline">
                    try again
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Join Ausly</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Get Started with <span className="gradient-text">Ausly</span>
              </h1>
              
              <p className="text-muted-foreground">
                Discover the best nightlife experiences
              </p>
            </div>

            {/* Form */}
            <div className="glass-card p-6 md:p-8 space-y-6">
              {/* Account Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">I want to</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                      accountType === "customer"
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      accountType === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-sm">Explore Venues</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Discover & book experiences
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAccountType("vendor")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                      accountType === "vendor"
                        ? "border-secondary bg-secondary/10 shadow-lg shadow-secondary/20"
                        : "border-border hover:border-secondary/50 hover:bg-secondary/5"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      accountType === "vendor" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-sm">List My Venue</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Manage & grow your business
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {accountType === "vendor" ? "Business Name" : "Full Name"}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={accountType === "vendor" ? "Your venue or business name" : "John Doe"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                    required
                    minLength={8}
                  />
                  {errors.password ? (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="neon"
                  size="xl"
                  className="w-full"
                  disabled={isLoading || !agreedToTerms}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      {accountType === "vendor" ? "Create Vendor Account" : "Create Account"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                size="xl"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
