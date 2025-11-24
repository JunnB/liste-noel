import { Suspense } from "react";
import ContributionsSkeleton from "@/components/skeletons/ContributionsSkeleton";
import ContributionsData from "./ContributionsData";

// OPTIMISATION : Cache de 30 secondes pour les contributions
export const revalidate = 30;

export default function ContributionsPage() {
  return (
    <Suspense fallback={<ContributionsSkeleton />}>
      <ContributionsData />
    </Suspense>
  );
}
