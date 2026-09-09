/**
 * Single source of truth for the public contact details.
 *
 * These strings were duplicated across the header, top bar, footer, contact
 * page and WhatsApp widget. The header and top bar read from here; the other
 * call sites still hold their own copies.
 */
export const CONTACT_PHONE = "+91 9446678765";
export const CONTACT_EMAIL = "info@maramtoursandtravels.com";

/** Digits only, for tel: links. */
export const CONTACT_PHONE_DIGITS = CONTACT_PHONE.replace(/[^\d]/g, "");
