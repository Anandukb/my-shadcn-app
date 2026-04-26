import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default function FixedDeparturesPage() {
    return (
        <CommonListingPage
            category="fixed-departure"
            title="Fixed Departures"
            subtitle="Explore our curated group tours with guaranteed departure dates."
            badgeText="Group Tours"
            bgImage="https://images.unsplash.com/photo-1527668752968-14ce70a64fac?q=80&w=2400&auto=format&fit=crop"
        />
    );
}
