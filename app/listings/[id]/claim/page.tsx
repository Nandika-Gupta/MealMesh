import { Suspense } from "react";
import ClaimClient from "./ClaimClient";

export default function ClaimPage() {
  return (
    <Suspense fallback={<main className="claim-page">Loading food listing...</main>}>
      <ClaimClient />
    </Suspense>
  );
}
