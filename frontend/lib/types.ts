export type UserRole = "PI" | "ETHICS" | "PV" | "REGULATOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  created_at: string;
}

export interface Site {
  id: string;
  name: string;
  location?: string;
  institution?: string;
  contact_name?: string;
  contact_email?: string;
  status: string;
}

export interface Trial {
  id: string;
  study_id: string;
  ctri_number?: string;
  title: string;
  short_title?: string;
  phase?: string;
  study_type?: string;
  intervention?: string;
  indication?: string;
  principal_investigator_id?: string;
  site_id?: string;
  target_sample_size?: number;
  enrolled_count: number;
  status: "DRAFT" | "SUBMITTED" | "ACTIVE" | "ENROLLING" | "SUSPENDED" | "COMPLETED";
  start_date?: string;
  expected_completion_date?: string;
  ethics_approval_date?: string;
  ethics_renewal_date?: string;
  protocol_version?: string;
  created_at: string;
  updated_at?: string;
  principal_investigator?: User;
  site?: Site;
}

export interface Participant {
  id: string;
  participant_code: string;
  trial_id: string;
  site_id?: string;
  age_group?: string;
  sex?: string;
  enrollment_date?: string;
  status: "SCREENING" | "ENROLLED" | "ACTIVE" | "COMPLETED" | "WITHDRAWN";
  last_visit?: string;
  next_visit?: string;
  created_at: string;
  site?: Site;
}

export interface AdverseEvent {
  id: string;
  trial_id: string;
  participant_id: string;
  reported_by_id?: string;
  event_term: string;
  ayurvedic_term?: string;
  meddra_term?: string;
  meddra_code?: string;
  onset_date: string;
  resolution_date?: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  is_serious: boolean;
  sae_criteria?: string[];
  causality?: "CERTAIN" | "PROBABLE" | "POSSIBLE" | "UNLIKELY" | "UNRELATED" | "UNCLASSIFIED";
  outcome?: "RECOVERED" | "RECOVERING" | "NOT_RECOVERED" | "FATAL" | "UNKNOWN";
  sae_reported_at?: string;
  sae_deadline?: string;
  sae_status?: "NOT_APPLICABLE" | "PENDING_24H" | "SUBMITTED_IN_TIME" | "OVERDUE";
  action_taken?: string;
  description?: string;
  ai_suggested_meddra?: string;
  ai_suggested_ayurvedic?: string;
  ai_confidence_score?: number;
  participant_code?: string;
  trial_study_id?: string;
  reporter_name?: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  created_at: string;
}

export interface TerminologySuggestion {
  meddra_term: string;
  meddra_code: string;
  system_organ_class: string;
  ayurvedic_correlate?: string;
  ayurvedic_category?: string;
  confidence_score: number;
  notes?: string;
}

export interface EthicsReview {
  id: string;
  trial_id: string;
  reviewer_id?: string;
  committee_name: string;
  review_type: "INITIAL" | "AMENDMENT" | "ANNUAL_CONTINUATION" | "SAE_REVIEW";
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "CONDITIONAL" | "REJECTED" | "LAPSED";
  submission_date: string;
  decision_date?: string;
  expiry_date?: string;
  protocol_version_reviewed?: string;
  comments?: string;
  conditions?: string;
  trial_study_id?: string;
  trial_title?: string;
  reviewer?: User;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  trial_id?: string;
  uploaded_by_id?: string;
  title: string;
  doc_type: "PROTOCOL" | "INFORMED_CONSENT" | "ETHICS_APPROVAL" | "SAE_REPORT" | "REGULATORY_SUBMISSION" | "OTHER";
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  version: string;
  checksum_sha256?: string;
  is_vaulted: boolean;
  status: string;
  uploader_name?: string;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  reason_for_change?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SaeAlert {
  id: string;
  trial_id: string;
  study_id: string;
  participant_code: string;
  event_term: string;
  severity: string;
  onset_date: string;
  sae_deadline?: string;
  hours_remaining?: number;
  sae_status: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface DashboardMetrics {
  total_trials: number;
  active_trials: number;
  total_participants: number;
  total_adverse_events: number;
  active_saes: number;
  overdue_saes: number;
  pending_ethics_reviews: number;
  compliance_score: number;
  trials_by_status: StatusDistribution[];
  ae_by_severity: StatusDistribution[];
  urgent_sae_alerts: SaeAlert[];
  recent_trials: {
    id: string;
    study_id: string;
    title: string;
    status: string;
    phase?: string;
    enrolled: number;
    target?: number;
    sae_count: number;
  }[];
}
