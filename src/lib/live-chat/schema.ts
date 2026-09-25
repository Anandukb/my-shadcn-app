import { z } from "zod";

export const startChatSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(30),
});

export const chatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export type StartChatInput = z.infer<typeof startChatSchema>;
