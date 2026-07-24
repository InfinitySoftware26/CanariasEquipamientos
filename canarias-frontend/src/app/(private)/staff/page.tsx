import { StaffHeader } from "@/components/staff/StaffHeader";
import { StaffList } from "@/components/staff/StaffList";

export default function StaffPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <StaffHeader />

      <StaffList />
    </div>
  );
}