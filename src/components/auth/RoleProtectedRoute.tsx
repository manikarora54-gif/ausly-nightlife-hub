import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole: "admin" | "vendor";
}

const RoleProtectedRoute = ({ children, requiredRole }: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const allowed = roles?.some(
          (r) => (r.role as string) === requiredRole || r.role === "admin"
        );
        setHasAccess(!!allowed);
      } catch {
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, authLoading, requiredRole]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (!hasAccess) {
    const label = requiredRole === "vendor" ? "Vendor Portal" : "Admin Dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the {label}. 
            {requiredRole === "vendor" && " Sign up as a Venue Owner to get vendor access."}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
            {requiredRole === "vendor" && (
              <Button variant="outline" asChild>
                <Link to="/signup">Create Vendor Account</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
