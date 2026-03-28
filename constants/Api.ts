/**
 * API Configuration for Rasad App
 * 
 * When developing locally:
 * - Android Emulator: Use http://10.0.2.2:8000/api
 * - iOS Simulator: Use http://localhost:8000/api
 * - Physical Device: Use your computer's local IP (e.g., http://192.168.1.10:8000/api)
 */

export const BASE_URL = 'http://192.168.18.14:8000/api';

export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/accounts/login/`,
  SIGNUP: `${BASE_URL}/accounts/signup/`,
  REFRESH_TOKEN: `${BASE_URL}/accounts/login/refresh/`,
  PROFILE: `${BASE_URL}/accounts/profile/`,
  ROUTES: `${BASE_URL}/accounts/routes/`,
  DELIVERIES: `${BASE_URL}/accounts/deliveries/daily/`,
};
