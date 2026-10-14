import { AuthUser } from "@/types/user";

export type LoginApiResponse = {
  success?: boolean;
  message?: string;
  user?: AuthUser | null;
};

export type LoginBackendResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: AuthUser | null;
};
