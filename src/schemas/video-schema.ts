import { z } from "zod";

import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from "@/constants/app";

export const videoFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "İsim zorunlu")
    .max(NAME_MAX_LENGTH, `En fazla ${NAME_MAX_LENGTH} karakter`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX_LENGTH, `En fazla ${DESCRIPTION_MAX_LENGTH} karakter`),
});

export type VideoFormValues = z.infer<typeof videoFormSchema>;