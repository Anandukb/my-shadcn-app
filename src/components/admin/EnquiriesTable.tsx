// src/components/admin/EnquiriesTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Inbox, ChevronDown, Mail, Phone,
  ExternalLink, AlertCircle, Archive, ArchiveRestore, CalendarPlus,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enquiry, EnquiryType } from "@/lib/enquiries/types";
import { extractErrorMessage } from "@/lib/extract-error-message";
import CreateBookingDialog from "@/components/admin/CreateBookingDialog";

async function fetchEnquiries(): Promise<Enquiry[]> {
  const res = await fetch("/api/enquiries");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load enquiries"));
  const json = await res.json();
  return json.enquiries as Enquiry[];
}

async function toggleArchived(id: number): Promise<Enquiry> {
  const res = await fetch(`/api/enquiries/${id}/archive`, { method: "PATCH" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update enquiry"));
  return res.json() as Promise<Enquiry>;
}

const TYPE_LABELS: Record<EnquiryType, string> = {
  contact: "Contact",
  hotel_booking: "Hotel Booking",
  hotel_search: "Hotel Search",
  book_now: "Book Now",
};

const TYPE_BADGE_COLORS: Record<EnquiryType, string> = {
  contact: "bg-emerald-500/10 text-adm-ok border-emerald-500/20",
  hotel_booking: "bg-blue-500/10 text-adm-accent border-blue-500/20",
  hotel_search: "bg-indigo-500/10 text-adm-indigo border-indigo-500/20",
  book_now: "bg-amber-500/10 text-adm-warn border-amber-500/20",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function formatDetailDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-adm-subtle uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-adm-fg">{value}</p>
    </div>
  );
}

function EnquiryDetails({ enquiry }: { enquiry: Enquiry }) {
  const d = enquiry.details;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-adm-page/40 border-t border-adm-line/60">
      {enquiry.message && (
        <div className="col-span-2 md:col-span-3">
          <DetailField label="Message" value={enquiry.message} />
        </div>
      )}

      {enquiry.type === "contact" && (
        <DetailField label="Service" value={String(d.service ?? "—")} />
      )}

      {(enquiry.type === "hotel_booking" || enquiry.type === "hotel_search") && (
        <>
          <DetailField label="Destination" value={String(d.destination ?? "—")} />
          <DetailField label="Check-in" value={formatDetailDate(d.checkInDate)} />
          <DetailField label="Check-out" value={formatDetailDate(d.checkOutDate)} />
          <DetailField label="Rooms" value={String(d.rooms ?? "—")} />
          <DetailField label="Adults" value={String(d.adults ?? "—")} />
          <DetailField label="Children" value={String(d.children ?? "—")} />
        </>
      )}

      {enquiry.type === "hotel_booking" && (
        <>
          <DetailField label="Nationality" value={String(d.nationality ?? "—")} />
          <div className="col-span-2 md:col-span-3">
            <DetailField label="Special Requests" value={String(d.specialRequests ?? "—")} />
          </div>
        </>
      )}

      {enquiry.type === "book_now" && (
        <>
          <DetailField label="Destination" value={String(d.destination ?? "—")} />
          <DetailField label="Travel Date" value={formatDetailDate(d.travelDate)} />
          <DetailField label="Travelers" value={String(d.travelers ?? "—")} />
          {enquiry.packageId !== null && (
            <div>
              <p className="text-[10px] font-bold text-adm-subtle uppercase tracking-wider mb-0.5">Package</p>
              <Link
                href="/admin/packages"
                className="inline-flex items-center gap-1 text-sm text-adm-accent hover:text-adm-accent hover:underline"
              >
                #{enquiry.packageId} <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EnquiryRow({
  enquiry,
  onToggleArchive,
  isTogglingArchive,
}: {
  enquiry: Enquiry;
  onToggleArchive: (id: number) => void;
  isTogglingArchive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  return (
    <div className={`border-b border-adm-line/60 last:border-b-0 ${enquiry.archived ? "opacity-50" : ""}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-adm-surface/30 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-adm-fg truncate">{enquiry.name ?? "—"}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-adm-muted">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{enquiry.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{enquiry.phone}</span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${TYPE_BADGE_COLORS[enquiry.type]}`}>
          {TYPE_LABELS[enquiry.type]}
        </span>
        <span
          className="shrink-0 text-xs text-adm-subtle w-28 text-right"
          title={enquiry.createdAt}
        >
          {relativeTime(enquiry.createdAt)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setBookingDialogOpen(true);
          }}
          title="Create Booking"
          className="shrink-0 p-2 rounded-xl text-adm-faint hover:text-adm-fg-2 hover:bg-adm-raised/30 transition-all cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleArchive(enquiry.id);
          }}
          disabled={isTogglingArchive}
          title={enquiry.archived ? "Unarchive" : "Archive"}
          className="shrink-0 p-2 rounded-xl text-adm-faint hover:text-adm-fg-2 hover:bg-adm-raised/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enquiry.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </button>
        <ChevronDown className={`h-4 w-4 shrink-0 text-adm-subtle transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>
      {expanded && <EnquiryDetails enquiry={enquiry} />}
      <CreateBookingDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} sourceEnquiry={enquiry} />
    </div>
  );
}

export default function EnquiriesTable() {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);

  const { data: enquiries = [], isLoading, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: fetchEnquiries,
  });

  const toggleArchivedMutation = useMutation({
    mutationFn: toggleArchived,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enquiries"] }),
  });

  const visibleEnquiries = enquiries.filter((enquiry) => showArchived || !enquiry.archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <label className="flex items-center gap-2 text-sm text-adm-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="h-4 w-4 rounded border-adm-line-strong bg-adm-surface accent-blue-600 cursor-pointer"
          />
          Show archived
        </label>
      </div>

      <div className="border border-adm-line/80 rounded-2xl overflow-hidden bg-adm-surface/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-adm-accent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-adm-danger mb-3" />
            <h3 className="text-base font-bold text-adm-fg-2">Failed to load enquiries</h3>
            <p className="text-xs text-adm-subtle max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : visibleEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Inbox className="h-12 w-12 text-adm-faint mb-3" />
            <h3 className="text-base font-bold text-adm-fg-2">
              {showArchived ? "No Archived Enquiries" : "No Enquiries Yet"}
            </h3>
            <p className="text-xs text-adm-subtle max-w-xs mt-1">
              {showArchived
                ? "Enquiries you archive will show up here."
                : "Submissions from the contact, hotel booking, hotel search, and booking forms will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {visibleEnquiries.map((enquiry) => (
              <EnquiryRow
                key={enquiry.id}
                enquiry={enquiry}
                onToggleArchive={(id) => toggleArchivedMutation.mutate(id)}
                isTogglingArchive={toggleArchivedMutation.isPending && toggleArchivedMutation.variables === enquiry.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
