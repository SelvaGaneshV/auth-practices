import z from "zod";

export const orgCodeSchema = z
  .string()
  .transform((val) => val.toUpperCase())
  .refine((val) => /^OG\d+$/.test(val), {
    message: "Must start with 'OG' followed by only numbers",
  });
