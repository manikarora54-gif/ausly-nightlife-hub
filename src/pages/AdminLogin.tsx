import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, check role and redirect
  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = roles?.some((r) => (r.role as string) === "admin");
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        setErrors({ general: "This account does not have admin access." });
      }
    };
    checkAdmin();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setErrors({ email: "Invalid email or password" });
      } else {
        setErrors({ email: error.message });
      }
    }
    // Role check + redirect handled by useEffect above
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setErrors({ general: `Google sign-in failed: ${error.message}` });
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred during Google sign-in" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-destructive/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] mx-auto p-6 relative z-10">
        {/* Admin badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive/80 to-primary flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Restricted access — authorized personnel only</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@ausly.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted/80 transition-all ${errors.email ? "border-destructive" : ""}`}
                required
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 h-12 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted/80 transition-all ${errors.password ? "border-destructive" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold mt-2 bg-gradient-to-r from-destructive/80 to-primary hover:from-destructive hover:to-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                Sign In to Admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Sign In with Google
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-8">
          This portal is for Ausly administrators only. Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
