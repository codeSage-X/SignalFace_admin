import { useAdminAuth } from './store';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api';

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

function authHeader(): Record<string, string> {
  const token = useAdminAuth.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message[0]
      : (data.message ?? 'Something went wrong. Please try again.');
    throw new ApiError(message, data.code);
  }

  return data as T;
}

export interface AdminAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    displayName: string;
    role: string;
    creatorStatus: string;
    pointsBalance: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
}

export interface MessageResponse {
  message: string;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    request<AdminAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  forgotPassword: (body: { email: string }) =>
    request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  verifyResetOtp: (body: { email: string; otp: string }) =>
    request<MessageResponse>('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  resetPassword: (body: { email: string; otp: string; password: string }) =>
    request<AdminAuthResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export interface PlatformGrowthPoint {
  month: string;
  users: number;
  creators: number;
}

export interface WeeklyVolumePoint {
  date: string;
  volume: number;
}

export interface ActivityItem {
  actor: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface OverviewData {
  totalUsers: number;
  activeCreators: number;
  activeSignals: number;
  walletVolume: string;
  platformGrowth: PlatformGrowthPoint[];
  weeklyTradeVolume: WeeklyVolumePoint[];
  recentActivity: ActivityItem[];
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'unverified' | 'suspended';
  joinDate: string;
  tier: string;
  trades: number;
  balance: string;
}

export interface AdminSignalRow {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  price: string;
  score: string;
  growthPct: string;
  subscribers: number;
  status: string;
  createdAt: string;
}

export const adminApi = {
  invite: (body: { email: string; displayName: string }) =>
    request<MessageResponse>('/admin/invite', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getOverview: () => request<OverviewData>('/admin/overview'),
  getUsers: () => request<AdminUserRow[]>('/admin/users'),
  getSignals: () => request<AdminSignalRow[]>('/admin/signals'),
  createSignal: (body: { title: string; worth: number }) =>
    request<AdminSignalRow>('/admin/signals', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
