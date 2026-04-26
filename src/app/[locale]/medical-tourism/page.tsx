import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default function MedicalTourismPage() {
    return (
        <CommonListingPage
            category="medical"
            title="Medical Tourism"
            subtitle="World-class healthcare paired with exceptional travel experiences"
            badgeText="Health & Wellness"
            bgImage="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2400&auto=format&fit=crop"
        />
    );
}
