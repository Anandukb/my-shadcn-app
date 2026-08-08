"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CalendarCheck, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/bookings/types";
import CreateBookingDialog from "@/components/admin/CreateBookingDialog";

async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch("/api/bookings");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load bookings"));
  const json = await res.json();
  return json.bookings as Booking[];
}

async function updateBooking(id: number, data: { status?: BookingStatus; paymentStatus?: PaymentStatus }): Promise<Booking> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update booking"));
  return res.json() as Promise<Booking>;
}

const STATUS_OPTIONS: BookingStatus[] = ["confirmed", "cancelled", "completed"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["unpaid", "partial", "paid"];

const selectCls = "h-8 rounded-lg border border-slate-800 bg-slate-950/40 text-white text-xs px-2 cursor-pointer";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function BookingRow({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { status?: BookingStatus; paymentStatus?: PaymentStatus }) => updateBooking(booking.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800/60 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{booking.name}</p>
        <p className="text-xs text-slate-400 truncate">{booking.email} · {booking.phone}</p>
      </div>
      <div className="w-40 shrink-0 text-xs text-slate-400 truncate">{booking.destination ?? "—"}</div>
      <div className="w-40 shrink-0 text-xs text-slate-500">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</div>
      <div className="w-20 shrink-0 text-xs text-slate-300">{booking.price != null ? `QAR ${booking.price}` : "—"}</div>
      <select
        value={booking.status}
        onChange={(e) => updateMutation.mutate({ status: e.target.value as BookingStatus })}
        disabled={updateMutation.isPending}
        className={selectCls}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={booking.paymentStatus}
        onChange={(e) => updateMutation.mutate({ paymentStatus: e.target.value as PaymentStatus })}
        disabled={updateMutation.isPending}
        className={selectCls}
      >
        {PAYMENT_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}

export default function BookingsTable() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)} className="h-11 px-5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl gap-1.5 shadow-lg cursor-pointer">
          <Plus className="h-5 w-5" />Create Booking
        </Button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load bookings</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <CalendarCheck className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Bookings Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Bookings you create here, or convert from an enquiry, will appear here.
            </p>
          </div>
        ) : (
          <div>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <CreateBookingDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
