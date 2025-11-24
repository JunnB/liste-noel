import { Suspense } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import DashboardData from "./DashboardData";

// OPTIMISATION : Cache de 30 secondes pour le dashboard
export const revalidate = 30;

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
