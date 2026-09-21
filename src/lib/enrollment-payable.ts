import { Student } from "@/types/student";

// A child account created from "Add Child" is stored as a PENDING record with
// no service chosen and a ₦0 total - it only exists so the child has a login.
// There is nothing to pay for yet, so it shouldn't show a cost, a "Complete
// Payment" button, or an "awaiting payment" banner. A record counts as having
// something to pay for once a service is picked or a price has been worked out.
export function hasServiceToPay(student: Pick<Student, "serviceDetails">): boolean {
  const details = student.serviceDetails;
  return !!details?.serviceType || (details?.totalCost ?? 0) > 0;
}
