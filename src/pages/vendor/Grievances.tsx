import { GrievanceList } from "@/components/grievance/GrievanceComponents";

const VendorGrievances = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Support & Grievances</h1>
        <p className="text-muted-foreground mt-1">Submit and track issues with the platform</p>
      </div>
      <GrievanceList userType="vendor" />
    </div>
  );
};

export default VendorGrievances;
