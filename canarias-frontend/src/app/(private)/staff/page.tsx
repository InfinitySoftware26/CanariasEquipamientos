import { StaffHeader } from "@/components/staff/StaffHeader";
import { StaffList } from "@/components/staff/StaffList";
import { Staff } from "@/types/staff/staff.type";

export default function StaffPage() {
  const staff: Staff[] = [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <StaffHeader />

      <StaffList staff={staff} />
    </div>
  );
}
