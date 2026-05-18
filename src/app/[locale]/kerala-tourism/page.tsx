import React from "react";
import { allPackages } from "@/data/packages";
import { KeralaTourismClient } from "@/components/packages/KeralaTourismClient";

export default function KeralaTourismPage() {
    const keralaPackages = allPackages.filter(
        (pkg) =>
            pkg.category === "kerala" ||
            (pkg.category === "medical" && pkg.location.toLowerCase().includes("kerala"))
    );

    return <KeralaTourismClient packages={keralaPackages} />;
}
