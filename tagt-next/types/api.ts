export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiErrorPayload = {
  message?: string;
};
