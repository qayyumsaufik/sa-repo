export interface ApiErrorResponse<TDetails = unknown> {
  code: string;
  message: string;
  details?: TDetails;
}
