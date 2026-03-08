import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles, Store, Users,
  CheckCircle, MapPin, Heart, Calendar, TrendingUp, BarChart3, Megaphone,
  Utensils, Music, Wine, PartyPopper
} from "lucide-react";
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
type OnboardingStep = "role" | "interests" | "account";

const customerInterests = [
  { id: "restaurants", label: "Restaurants", icon: Utensils, emoji: "🍽️" },
  { id: "bars", label: "Bars & Cocktails", icon: Wine, emoji: "🍸" },
  { id: "clubs", label: "Clubs & Nightlife", icon: Music, emoji: "🎵" },
  { id: "events", label: "Events & Concerts", icon: PartyPopper, emoji: "🎉" },
  { id: "culture", label: "Culture & Arts", icon: Sparkles, emoji: "🎨" },
  { id: "food", label: "Street Food & Markets", icon: MapPin, emoji: "🥘" },
];

const vendorBenefits = [
  { icon: TrendingUp, title: "Reach thousands", description: "Get discovered by locals and tourists across Germany" },
  { icon: Calendar, title: "Manage bookings", description: "Streamlined reservation and event ticketing system" },
  { icon: BarChart3, title: "Track analytics", description: "Insights on views, bookings, and customer trends" },
  { icon: Megaphone, title: "Promote events", description: "Create and promote special events and experiences" },
];

const vendorTypes = [
  { id: "restaurant", label: "Restaurant / Café", emoji: "🍽️" },
  { id: "bar", label: "Bar / Lounge", emoji: "🍸" },
  { id: "club", label: "Club / Venue", emoji: "🎵" },
  { id: "events", label: "Event Organizer", emoji: "🎪" },
];

const SignUp = () => {
  const [step, setStep] = useState<OnboardingStep>("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedVenueType, setSelectedVenueType] = useState<string | null>(null);
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

  const totalSteps = 3;
  const currentStepNum = step === "role" ? 1 : step === "interests" ? 2 : 3;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

    const result = signUpSchema.safeParse({
      name, email, password, confirmPassword,
      accountType: accountType || "customer",
    });
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
    const { error } = await signUp(email, password, name, accountType || "customer");
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

  const goNext = () => {
    if (step === "role") setStep("interests");
    else if (step === "interests") setStep("account");
  };

  const goBack = () => {
    if (step === "account") setStep("interests");
    else if (step === "interests") setStep("role");
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="glass-card p-8 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-bold">Check Your Email!</h1>
                <p className="text-muted-foreground">
                  We've sent a verification link to <strong className="text-foreground">{email}</strong>. Please check your inbox and click the link to verify your account.
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
          <div className="max-w-lg mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {["Who are you?", accountType === "vendor" ? "Your venue" : "Your interests", "Create account"].map((label, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                        i + 1 < currentStepNum
                          ? "bg-primary text-primary-foreground"
                          : i + 1 === currentStepNum
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i + 1 < currentStepNum ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-xs font-medium hidden sm:inline",
                      i + 1 <= currentStepNum ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Role Selection */}
            {step === "role" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Join Ausly</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
                    How will you use <span className="gradient-text">Ausly</span>?
                  </h1>
                  <p className="text-muted-foreground">Choose your path to get a personalized experience</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={cn(
                      "relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 text-left group",
                      accountType === "customer"
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                      accountType === "customer"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-heading font-bold text-lg mb-1">Explorer</h3>
                      <p className="text-sm text-muted-foreground">
                        Discover restaurants, events, and nightlife across Germany
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      {["🍽️ Dine", "🎉 Events", "🗺️ Explore"].map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {accountType === "customer" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>

                  {/* Vendor Card */}
                  <button
                    type="button"
                    onClick={() => setAccountType("vendor")}
                    className={cn(
                      "relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 text-left group",
                      accountType === "vendor"
                        ? "border-secondary bg-secondary/5 shadow-xl shadow-secondary/10"
                        : "border-border hover:border-secondary/40 hover:bg-secondary/5"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                      accountType === "vendor"
                        ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30"
                        : "bg-muted text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary"
                    )}>
                      <Store className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-heading font-bold text-lg mb-1">Venue Owner</h3>
                      <p className="text-sm text-muted-foreground">
                        List your venue, manage bookings, and grow your business
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-1">
                      {["📊 Analytics", "📅 Bookings", "📣 Promote"].map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {accountType === "vendor" && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-secondary-foreground" />
                      </div>
                    )}
                  </button>
                </div>

                <Button
                  onClick={goNext}
                  variant="neon"
                  size="xl"
                  className="w-full"
                  disabled={!accountType}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            )}

            {/* Step 2: Customer Interests */}
            {step === "interests" && accountType === "customer" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                    What are you into?
                  </h2>
                  <p className="text-muted-foreground">
                    Pick your interests so we can personalize your feed
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {customerInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-3xl">{interest.emoji}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {interest.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button onClick={goBack} variant="outline" size="lg" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={goNext} variant="neon" size="lg" className="flex-[2]">
                    {selectedInterests.length > 0 ? "Continue" : "Skip for now"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Vendor Type & Benefits */}
            {step === "interests" && accountType === "vendor" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                    What type of venue?
                  </h2>
                  <p className="text-muted-foreground">
                    Tell us about your business so we can tailor your dashboard
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {vendorTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedVenueType(type.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                        selectedVenueType === type.id
                          ? "border-secondary bg-secondary/10 shadow-md shadow-secondary/10"
                          : "border-border hover:border-secondary/30 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-2xl">{type.emoji}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        selectedVenueType === type.id ? "text-secondary" : "text-foreground"
                      )}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Benefits */}
                <div className="glass-card p-5 space-y-4">
                  <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                    What you'll get
                  </h3>
                  <div className="space-y-3">
                    {vendorBenefits.map((benefit) => (
                      <div key={benefit.title} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{benefit.title}</p>
                          <p className="text-xs text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={goBack} variant="outline" size="lg" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={goNext} variant="neon" size="lg" className="flex-[2]">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Account Creation */}
            {step === "account" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
                    Create your account
                  </h2>
                  <p className="text-muted-foreground">
                    {accountType === "vendor"
                      ? "Set up your vendor account to start listing"
                      : "Almost there! Fill in your details to get started"}
                  </p>
                </div>

                <div className="glass-card p-6 md:p-8 space-y-6">
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

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 text-muted-foreground">Or with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="text-xs text-muted-foreground">Min 8 characters</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" />
                          Confirm
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
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 accent-primary"
                        required
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                        {" "}and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" onClick={goBack} variant="outline" size="lg" className="flex-1">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="neon"
                        size="lg"
                        className="flex-[2]"
                        disabled={isLoading || !agreedToTerms}
                      >
                        {isLoading ? "Creating account..." : (
                          <>
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
