"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../../contexts/AppContext";
import ContestantDashboard from "../../../components/ContestantDashboard";
import { Role } from "../../../types";

export default function ContestantDashboardPage() {
  const { currentUser, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and user is not valid
    if (!isLoading && (!currentUser || currentUser.role !== Role.Contestant)) {
      router.push("/");
    }
  }, [currentUser, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading || !currentUser || currentUser.role !== Role.Contestant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <ContestantDashboard />;
}
