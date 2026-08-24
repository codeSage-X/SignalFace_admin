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
  actorUsername: string;
  /** Null when the account has never uploaded one — fall back to initials. */
  actorAvatarUrl: string | null;
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

export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'BLOCKED';

export interface AdminUserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  /** Display state: moderation takes precedence over email verification. */
  status: 'active' | 'unverified' | 'restricted' | 'blocked';
  accountStatus: AccountStatus;
  statusReason: string | null;
  role: string;
  joinDate: string;
  tier: string;
  trades: number;
  balance: string;
}

/** One page of the admin user list. */
export interface AdminUsersPage {
  items: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
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

export type RewardType = 'SIGNUP_BONUS' | 'REFERRAL_BONUS' | 'ONE_TIME' | 'RECURRING';

export interface AdminReward {
  id: string;
  name: string;
  description: string | null;
  type: RewardType;
  amount: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  cooldownHours: number | null;
  maxClaims: number | null;
  maxPerUser: number | null;
  totalClaims: number;
  totalPaid: string;
  createdAt: string;
}

/** Everything the admin form can set. Omitted fields are left unchanged. */
export interface RewardInput {
  name?: string;
  description?: string | null;
  type?: RewardType;
  amount?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  cooldownHours?: number | null;
  maxClaims?: number | null;
  maxPerUser?: number | null;
}


// ── Platform operations ──────────────────────────────────────────────────────

export type RealmStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type PostModeration = 'VISIBLE' | 'CENSORED' | 'REMOVED';

export interface AdminPerson {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminRealmRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: RealmStatus;
  tagline: string | null;
  iconUrl: string | null;
  createdAt: string;
  postsCount: number;
  followersCount: number;
  owner: AdminPerson;
}

export interface AdminTradeRow {
  id: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  pricePerUnit: string;
  totalPoints: string;
  createdAt: string;
  user: AdminPerson;
  signalName: string;
}

export interface WalletStats {
  circulatingPoints: string;
  totalTrades: number;
  totalVolume: string;
  volume24h: string;
  holders: number;
}

export interface AdminModerationRow {
  id: string;
  body: string | null;
  mediaUrls: string[];
  createdAt: string;
  moderation: PostModeration;
  moderationNote: string | null;
  appealNote: string | null;
  appealedAt: string | null;
  reportCount: number;
  reasons: string[];
  author: AdminPerson;
}

export interface ScoringConfig {
  wFollowers: number;
  wLikes: number;
  wComments: number;
  wShares: number;
  wGrowth: number;
  priceBase: number;
  priceK: number;
  smoothing: number;
  updatedAt: string;
}

export interface ReferralRow extends AdminPerson {
  referralCode: string;
  referredCount: number;
  verifiedCount: number;
}

export interface ReferralStats {
  items: ReferralRow[];
  totals: { totalReferred: number; bonusesPaid: number; pointsPaid: string };
  page: number;
  pageSize: number;
}

export interface PlatformSettingRow {
  key: string;
  value: string;
  updatedAt: string;
}

export interface AuditRow {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  summary: string | null;
  metadata: unknown;
  createdAt: string;
  actor: AdminPerson | null;
}

export const adminApi = {
  getRewards: () => request<{ items: AdminReward[] }>('/admin/rewards'),
  createReward: (body: RewardInput) =>
    request<AdminReward>('/admin/rewards', { method: 'POST', body: JSON.stringify(body) }),
  updateReward: (id: string, body: RewardInput) =>
    request<AdminReward>(`/admin/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteReward: (id: string) =>
    request<{ id: string; deleted: boolean; deactivated: boolean }>(`/admin/rewards/${id}`, {
      method: 'DELETE',
    }),
  invite: (body: { email: string; displayName: string }) =>
    request<MessageResponse>('/admin/invite', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getOverview: () => request<OverviewData>('/admin/overview'),
  getUsers: (params: { q?: string; page?: number; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.q?.trim()) search.set('q', params.q.trim());
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    return request<AdminUsersPage>(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUser: (id: string, body: { displayName?: string; username?: string; email?: string }) =>
    request<AdminUserRow>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  /** Restrict (under review), block (banned) or reinstate. */
  setUserStatus: (id: string, body: { status: AccountStatus; reason?: string }) =>
    request<AdminUserRow>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteUser: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
  // ── Creator approvals & realms ─────────────────────────────────────────────
  getRealms: (params: { status?: string; q?: string; page?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.q) search.set('q', params.q);
    if (params.page) search.set('page', String(params.page));
    const qs = search.toString();
    return request<Paged<AdminRealmRow>>(`/admin/realms${qs ? `?${qs}` : ''}`);
  },
  setRealmStatus: (id: string, body: { status: RealmStatus; note?: string }) =>
    request<{ id: string; status: RealmStatus }>(`/admin/realms/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // ── Trading & wallets ──────────────────────────────────────────────────────
  getTrades: (params: { q?: string; page?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.q) search.set('q', params.q);
    if (params.page) search.set('page', String(params.page));
    const qs = search.toString();
    return request<Paged<AdminTradeRow>>(`/admin/trades${qs ? `?${qs}` : ''}`);
  },
  getWalletStats: () => request<WalletStats>('/admin/wallet-stats'),

  // ── Content moderation ─────────────────────────────────────────────────────
  getModeration: (params: { status?: string; page?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.page) search.set('page', String(params.page));
    const qs = search.toString();
    return request<Paged<AdminModerationRow>>(`/admin/moderation${qs ? `?${qs}` : ''}`);
  },
  setPostModeration: (id: string, body: { moderation: PostModeration; note?: string }) =>
    request<{ id: string; moderation: PostModeration }>(`/admin/posts/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // ── Scoring ────────────────────────────────────────────────────────────────
  getScoring: () => request<ScoringConfig>('/admin/scoring'),
  updateScoring: (body: Partial<Omit<ScoringConfig, 'updatedAt'>>) =>
    request<ScoringConfig>('/admin/scoring', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  // ── Referrals ──────────────────────────────────────────────────────────────
  getReferrals: (params: { page?: number } = {}) =>
    request<ReferralStats>(`/admin/referrals${params.page ? `?page=${params.page}` : ''}`),

  // ── Settings & audit ───────────────────────────────────────────────────────
  getSettings: () => request<{ items: PlatformSettingRow[] }>('/admin/settings'),
  updateSetting: (body: { key: string; value: string }) =>
    request<PlatformSettingRow>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  getAudit: (params: { action?: string; page?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.action) search.set('action', params.action);
    if (params.page) search.set('page', String(params.page));
    const qs = search.toString();
    return request<Paged<AuditRow>>(`/admin/audit${qs ? `?${qs}` : ''}`);
  },

  getSignals: () => request<AdminSignalRow[]>('/admin/signals'),
  createSignal: (body: { title: string; worth: number }) =>
    request<AdminSignalRow>('/admin/signals', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
