"use client";

import dynamic from "next/dynamic";

const SphereCanvas = dynamic(() => import("./sphere"), {
  ssr: false,
});

export default function SphereClient() {
  return <SphereCanvas />;
}
