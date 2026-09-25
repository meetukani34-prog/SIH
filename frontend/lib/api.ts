import {
  User,
  Trial,
  Participant,
  AdverseEvent,
  EthicsReview,
  DocumentRecord,
  AuditLogRecord,
  NotificationItem,
  DashboardMetrics,
  SaeAlert,
  TerminologySuggestion,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8000/api");

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ayurctms_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ayurctms_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ayurctms_token");
    localStorage.removeItem("ayurctms_user");
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ayurctms_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ayurctms_user", JSON.stringify(user));
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request<{ access_token: string; token_type: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    setToken(data.access_token);
    setCurrentUser(data.user);
    return data;
  },

  getMe: () => request<User>("/auth/me"),

  // Dashboard
  getDashboardMetrics: () => request<DashboardMetrics>("/dashboard/metrics"),

  // Trials
  getTrials: (params?: { status?: string; phase?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.phase) query.append("phase", params.phase);
    if (params?.search) query.append("search", params.search);
    return request<Trial[]>(`/trials?${query.toString()}`);
  },

  getTrial: (id: string) => request<Trial>(`/trials/${id}`),

  createTrial: (trialData: Partial<Trial>) =>
    request<Trial>("/trials", {
      method: "POST",
      body: JSON.stringify(trialData),
    }),

  updateTrial: (id: string, updates: Partial<Trial> & { reason_for_change: string }) =>
    request<Trial>(`/trials/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getTrialSummary: (id: string) => request<any>(`/trials/${id}/summary`),

  // Participants
  getParticipants: (params?: { trial_id?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.trial_id) query.append("trial_id", params.trial_id);
    if (params?.status) query.append("status", params.status);
    return request<Participant[]>(`/participants?${query.toString()}`);
  },

  createParticipant: (participantData: Partial<Participant>) =>
    request<Participant>("/participants", {
      method: "POST",
      body: JSON.stringify(participantData),
    }),

  updateParticipant: (
    id: string,
    updates: Partial<Participant> & { reason_for_change: string }
  ) =>
    request<Participant>(`/participants/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Adverse Events
  getAdverseEvents: (params?: { trial_id?: string; is_serious?: boolean; sae_status?: string }) => {
    const query = new URLSearchParams();
    if (params?.trial_id) query.append("trial_id", params.trial_id);
    if (params?.is_serious !== undefined) query.append("is_serious", String(params.is_serious));
    if (params?.sae_status) query.append("sae_status", params.sae_status);
    return request<AdverseEvent[]>(`/adverse-events?${query.toString()}`);
  },

  getSaeCountdownList: () => request<SaeAlert[]>("/adverse-events/sae/active-countdown"),

  createAdverseEvent: (aeData: Partial<AdverseEvent>) =>
    request<AdverseEvent>("/adverse-events", {
      method: "POST",
      body: JSON.stringify(aeData),
    }),

  updateAdverseEvent: (
    id: string,
    updates: Partial<AdverseEvent> & { reason_for_change: string }
  ) =>
    request<AdverseEvent>(`/adverse-events/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // AI Terminology
  suggestTerminology: (term: string, context?: string) =>
    request<{ query: string; suggestions: TerminologySuggestion[]; source: string }>(
      "/terminology/suggest",
      {
        method: "POST",
        body: JSON.stringify({ term, context }),
      }
    ),

  // Compliance & Ethics
  getEthicsReviews: (params?: { trial_id?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.trial_id) query.append("trial_id", params.trial_id);
    if (params?.status) query.append("status", params.status);
    return request<EthicsReview[]>(`/compliance/reviews?${query.toString()}`);
  },

  submitEthicsReview: (data: Partial<EthicsReview>) =>
    request<EthicsReview>("/compliance/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEthicsReview: (
    id: string,
    updates: Partial<EthicsReview> & { reason_for_change: string }
  ) =>
    request<EthicsReview>(`/compliance/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getComplianceScorecard: () => request<any>("/compliance/scorecard"),

  // Documents
  getDocuments: (params?: { trial_id?: string; doc_type?: string }) => {
    const query = new URLSearchParams();
    if (params?.trial_id) query.append("trial_id", params.trial_id);
    if (params?.doc_type) query.append("doc_type", params.doc_type);
    return request<DocumentRecord[]>(`/documents?${query.toString()}`);
  },

  uploadDocument: (data: Partial<DocumentRecord>) =>
    request<DocumentRecord>("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Audit Logs
  getAuditLogs: (params?: { entity_type?: string; action?: string; user_email?: string }) => {
    const query = new URLSearchParams();
    if (params?.entity_type) query.append("entity_type", params.entity_type);
    if (params?.action) query.append("action", params.action);
    if (params?.user_email) query.append("user_email", params.user_email);
    return request<AuditLogRecord[]>(`/audit-logs?${query.toString()}`);
  },

  // Notifications
  getNotifications: (unreadOnly = false) =>
    request<NotificationItem[]>(`/notifications?unread_only=${unreadOnly}`),

  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: "PUT" }),

  markAllNotificationsRead: () =>
    request<{ message: string }>("/notifications/mark-all-read", { method: "PUT" }),

  // Exports
  getExportFormats: () => request<any[]>("/exports/formats"),
  getFhirBundle: (trialId: string) => request<any>(`/exports/fhir/${trialId}`),
  getSdtmDataset: (trialId: string, domain: string) =>
    request<any>(`/exports/sdtm/${trialId}/${domain}`),
  getExportCsvUrl: (trialId: string, domain: string) =>
    `${API_BASE_URL}/exports/csv/${trialId}/${domain}`,

  // Users
  getUsers: (role?: string) => {
    const query = role ? `?role=${role}` : "";
    return request<User[]>(`/users${query}`);
  },
};
