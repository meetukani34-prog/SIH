-- ==========================================================
-- AyurCTMS Database Schema (PostgreSQL / Supabase)
-- 21 CFR Part 11 & AYUSH GCP Compliant Architecture
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- PI, ETHICS, PV, REGULATOR, ADMIN
    institution VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. SITES
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    institution VARCHAR(255),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRIALS
CREATE TABLE IF NOT EXISTS trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id VARCHAR(50) UNIQUE NOT NULL,
    ctri_number VARCHAR(100),
    title TEXT NOT NULL,
    short_title TEXT,
    phase VARCHAR(100),
    study_type VARCHAR(100),
    intervention TEXT,
    indication TEXT,
    principal_investigator_id UUID REFERENCES users(id),
    site_id UUID REFERENCES sites(id),
    target_sample_size INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    start_date DATE,
    expected_completion_date DATE,
    ethics_approval_date DATE,
    ethics_renewal_date DATE,
    protocol_version VARCHAR(50) DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_trials_study_id ON trials(study_id);
CREATE INDEX IF NOT EXISTS idx_trials_status ON trials(status);

-- 4. PARTICIPANTS
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_code VARCHAR(50) UNIQUE NOT NULL, -- AYU-XXXX
    trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id),
    age_group VARCHAR(50),
    sex VARCHAR(20),
    enrollment_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'SCREENING',
    last_visit DATE,
    next_visit DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_participants_code ON participants(participant_code);
CREATE INDEX IF NOT EXISTS idx_participants_trial ON participants(trial_id);

-- 5. ADVERSE EVENTS
CREATE TABLE IF NOT EXISTS adverse_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    reported_by_id UUID REFERENCES users(id),
    event_term VARCHAR(255) NOT NULL,
    ayurvedic_term VARCHAR(255),
    meddra_term VARCHAR(255),
    meddra_code VARCHAR(50),
    onset_date TIMESTAMPTZ NOT NULL,
    resolution_date TIMESTAMPTZ,
    severity VARCHAR(50) NOT NULL, -- MILD, MODERATE, SEVERE
    is_serious BOOLEAN NOT NULL DEFAULT FALSE,
    sae_criteria JSONB,
    causality VARCHAR(50),
    outcome VARCHAR(50),
    sae_reported_at TIMESTAMPTZ,
    sae_deadline TIMESTAMPTZ,
    sae_status VARCHAR(50) DEFAULT 'NOT_APPLICABLE',
    action_taken VARCHAR(255),
    description TEXT,
    ai_suggested_meddra VARCHAR(255),
    ai_suggested_ayurvedic VARCHAR(255),
    ai_confidence_score REAL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_adverse_events_trial ON adverse_events(trial_id);
CREATE INDEX IF NOT EXISTS idx_adverse_events_serious ON adverse_events(is_serious);

-- 6. ETHICS REVIEWS
CREATE TABLE IF NOT EXISTS ethics_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    committee_name VARCHAR(255) NOT NULL,
    review_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    submission_date DATE NOT NULL,
    decision_date DATE,
    expiry_date DATE,
    protocol_version_reviewed VARCHAR(50),
    comments TEXT,
    conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ethics_reviews_trial ON ethics_reviews(trial_id);
CREATE INDEX IF NOT EXISTS idx_ethics_reviews_status ON ethics_reviews(status);

-- 7. DOCUMENTS (VAULT)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID REFERENCES trials(id) ON DELETE CASCADE,
    uploaded_by_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    version VARCHAR(50) DEFAULT '1.0',
    checksum_sha256 VARCHAR(64),
    is_vaulted BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LOGS (21 CFR PART 11 IMMUTABLE LEDGER)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    reason_for_change VARCHAR(500),
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    severity VARCHAR(50) NOT NULL DEFAULT 'INFO',
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
