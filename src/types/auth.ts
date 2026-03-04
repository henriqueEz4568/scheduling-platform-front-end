import { AuthUser } from "@/types/user";

export type LoginApiResponse = {
  success?: boolean;
  message?: string;
  user?: AuthUser | null;
};
