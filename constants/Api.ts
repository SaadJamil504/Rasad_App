/**
 * API Configuration for Rasad App
 * 
 * When developing locally:
 * - Android Emulator: Use http://10.0.2.2:8000/api
 * - iOS Simulator: Use http://localhost:8000/api
 * - Physical Device: Use your computer's local IP (e.g., http://192.168.1.10:8000/api)
 */

export const BASE_URL = 'https://rasad-production-a567.up.railway.app/api';

export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/accounts/login/`,
  SIGNUP: `${BASE_URL}/accounts/signup/`,
  REFRESH_TOKEN: `${BASE_URL}/accounts/login/refresh/`,
  PROFILE: `${BASE_URL}/accounts/profile/`,
  ROUTES: `${BASE_URL}/accounts/routes/`,
  DELIVERIES: `${BASE_URL}/accounts/deliveries/daily/`,
  OWNER_DAILY_DELIVERIES: `${BASE_URL}/accounts/deliveries/owner-daily/`,

  CUSTOMERS: `${BASE_URL}/accounts/staff/`,
  CUSTOMERS_LIST: `${BASE_URL}/accounts/staff/?role=customer`,
  DASHBOARD_STATS: `${BASE_URL}/accounts/collection-stats/`,
  DASHBOARD_ALERTS: `${BASE_URL}/accounts/dashboard/alerts/`,
  DASHBOARD_REPORTS: `${BASE_URL}/accounts/dashboard/reports/`,
  DELIVERIES_STATUS: `${BASE_URL}/accounts/deliveries/status/`,
  DELIVERIES_HISTORY: `${BASE_URL}/accounts/deliveries/history/`,
  ADJUSTMENTS_LIST: `${BASE_URL}/accounts/adjustments/list/`,
  ADJUSTMENTS_CREATE: `${BASE_URL}/accounts/adjustments/create/`,

  INVITATIONS: `${BASE_URL}/accounts/invitations/`,
  INVITATION_SIGNUP: `${BASE_URL}/accounts/invitations/signup/`,
  INVITATION_VALIDATE: (token: string) => `${BASE_URL}/accounts/invitations/validate/${token}/`,
  DRIVERS: `${BASE_URL}/accounts/staff/`,
  DRIVERS_LIST: `${BASE_URL}/accounts/staff/?role=driver`,
  PAYMENTS_LIST: `${BASE_URL}/accounts/payments/list/`,
  PAYMENT_CREATE: `${BASE_URL}/accounts/payments/report/`,
  PAYMENT_CONFIRM: (id: number) => `${BASE_URL}/accounts/payments/confirm/${id}/`,
  PAYMENT_REJECT: (id: number) => `${BASE_URL}/accounts/payments/reject/${id}/`,
  DAILY_REPORTS: `${BASE_URL}/accounts/daily-report/`,
  DRIVER_CUSTOMERS: `${BASE_URL}/accounts/driver-customers/`,
  DRIVER_STATS: `${BASE_URL}/accounts/driver-stats/`,
  BILL_PDF: `${BASE_URL}/accounts/bill/pdf/`,
};



