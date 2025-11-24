import { Suspense } from "react";
import ContributionsSkeleton from "@/components/skeletons/ContributionsSkeleton";
import ContributionsData from "./ContributionsData";

export default function ContributionsPage() {
  return (
    <Suspense fallback={<ContributionsSkeleton />}>
      <ContributionsData />
    </Suspense>
  );
}
