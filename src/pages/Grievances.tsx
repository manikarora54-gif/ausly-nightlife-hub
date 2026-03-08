import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { GrievanceList } from "@/components/grievance/GrievanceComponents";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const CustomerGrievances = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: "/grievances" }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Grievances" }]} />
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              My <span className="gradient-text">Grievances</span>
            </h1>
            <p className="text-muted-foreground">Submit and track issues with venues, events, or bookings.</p>
          </div>
          <GrievanceList userType="customer" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerGrievances;
