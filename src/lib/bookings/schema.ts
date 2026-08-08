import { z } from "zod";

export const bookingInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelers: z.number().optional(),
  packageId: z.number().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  enquiryId: z.number().optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const bookingUpdateSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]).optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
});

export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
