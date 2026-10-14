export type ApiErrorResponse = {
  success?: boolean;
  message?: string;
};

export type LogoutApiResponse = {
  success: boolean;
  message: string;
};

export type ApiErrorBody = {
  success: false;
  message: string;
};
