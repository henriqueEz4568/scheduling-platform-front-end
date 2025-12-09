import z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type Login = z.infer<typeof loginSchema>;
export type FormFields = {
  email: string;
  password: string;
};
