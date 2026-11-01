/**
 * Business contact details. Fill these in once they are reconfirmed with the business
 * (design.md §11) and every place that shows them — footer, contact page — updates together.
 * While a value is `null` the site shows a visible bracketed placeholder instead of a guess.
 */
export const CONTACT = {
  phone: null as string | null,
  whatsapp: null as string | null,
  email: null as string | null,
  address: null as string | null,
  instagram: "https://www.instagram.com/_otpb_/",
};

export const PLACEHOLDER = {
  phone: "[PHONE NUMBER]",
  whatsapp: "[WHATSAPP NUMBER]",
  email: "[EMAIL ADDRESS]",
  address: "[SHOWROOM / FACTORY ADDRESS]",
};
