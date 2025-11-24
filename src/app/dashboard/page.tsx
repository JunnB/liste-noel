import { Suspense } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import DashboardData from "./DashboardData";

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
