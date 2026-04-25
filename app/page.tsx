import React from "react";
import TopNavBar from "@/components/TopNavBar";
import CareNavView from "@/components/CareNavView";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <TopNavBar />
      <main className="flex-1 w-full">
        <CareNavView />
      </main>
    </div>
  );
}
