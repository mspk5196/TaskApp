SET FOREIGN_KEY_CHECKS = 0;

-- ===============================
-- 1. USERS (EVERYTHING IS A USER)
-- ===============================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('HUMAN','ROLE','INFRASTRUCTURE','ACTIVITY') NOT NULL,
    subtype VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    score INT DEFAULT 0,
    reports_to BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_users_email (email),
    FOREIGN KEY (reports_to) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 2. USER ROLES (ACCEPTANCE BASED)
-- ===============================
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_user_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    FOREIGN KEY (role_user_id) REFERENCES users(id),
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 3. OWNERSHIP TRANSFERS
-- ===============================
CREATE TABLE IF NOT EXISTS ownership_transfers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_user_id BIGINT NOT NULL,
    old_owner_id BIGINT NOT NULL,
    new_owner_id BIGINT NOT NULL,
    status ENUM('PENDING','ACCEPTED') DEFAULT 'PENDING',
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_user_id) REFERENCES users(id),
    FOREIGN KEY (old_owner_id) REFERENCES users(id),
    FOREIGN KEY (new_owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 4. TASKS (MASTER)
-- ===============================
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_task_id BIGINT NULL,
    task_type ENUM('FIXED','DATE_ONLY','FLOATING','SUBSCRIPTION','RECURRING','BIDDING','PACKAGE') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    owner_id BIGINT NOT NULL,
    creator_id BIGINT NOT NULL,
    score INT DEFAULT 0,
    penalty INT DEFAULT 0,
    penalty_per_hour INT DEFAULT 0,
    closing_criteria TEXT NOT NULL,
    start_criteria TEXT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    place_requirement VARCHAR(255) NULL,
    status ENUM(
        'CREATED','SENT','PENDING_ACCEPTANCE','ACCEPTED',
        'CALENDAR_PLACED','IN_PROGRESS','PAUSED',
        'COMPLETED','PENDING_APPROVAL','CLOSED',
        'OVERDUE','CANCELLED'
    ) DEFAULT 'CREATED',
    acknowledged_at TIMESTAMP NULL,
    accepted_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 5. TASK ASSIGNMENTS
-- ===============================
CREATE TABLE IF NOT EXISTS task_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    assignee_id BIGINT NOT NULL,
    status ENUM('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
    response_reason TEXT,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 6. CALENDAR SLOTS
-- ===============================
CREATE TABLE IF NOT EXISTS calendar_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    slot_type ENUM('TASK','LEAVE','ON_DUTY','BLOCK') NOT NULL,
    status ENUM('RESERVED','ACTIVE','COMPLETED','CANCELLED') DEFAULT 'RESERVED',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 7. CALENDAR CHANGE REQUESTS
-- ===============================
CREATE TABLE IF NOT EXISTS calendar_change_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    calendar_slot_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    change_type ENUM('MOVE','CANCEL','DELEGATE') NOT NULL,
    status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calendar_slot_id) REFERENCES calendar_slots(id),
    FOREIGN KEY (requested_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 8. DAILY ACKNOWLEDGEMENTS
-- ===============================
CREATE TABLE IF NOT EXISTS daily_acknowledgements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP NULL,
    UNIQUE KEY uniq_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 9. TASK TIME RULES
-- ===============================
CREATE TABLE IF NOT EXISTS task_time_rules (
    task_id BIGINT PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    fixed_start_time TIME,
    fixed_end_time TIME,
    daily_quota_minutes INT,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 10. RECURRING TASK INSTANCES
-- ===============================
CREATE TABLE IF NOT EXISTS recurring_task_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_task_id BIGINT NOT NULL,
    instance_date DATE NOT NULL,
    task_id BIGINT NOT NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 11. TASK DEPENDENCIES
-- ===============================
CREATE TABLE IF NOT EXISTS task_dependencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_task_id BIGINT NOT NULL,
    child_task_id BIGINT NOT NULL,
    dependency_type ENUM('SEQUENTIAL','PARALLEL') NOT NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id),
    FOREIGN KEY (child_task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 12. MEETING ROLES
-- ===============================
CREATE TABLE IF NOT EXISTS meeting_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_user_id BIGINT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    prerequisite_task_id BIGINT NULL,
    FOREIGN KEY (meeting_user_id) REFERENCES users(id),
    FOREIGN KEY (prerequisite_task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 13. TEMPORARY ACCEPTANCES
-- ===============================
CREATE TABLE IF NOT EXISTS temporary_acceptances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 14. ESCALATIONS
-- ===============================
CREATE TABLE IF NOT EXISTS escalations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT NOT NULL,
    escalation_level INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 15. INFRASTRUCTURE MAPPING
-- ===============================
CREATE TABLE IF NOT EXISTS infrastructure_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    infra_user_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (infra_user_id) REFERENCES users(id),
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 16. VEHICLE ASSIGNMENTS
-- ===============================
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_user_id BIGINT NOT NULL,
    driver_user_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    FOREIGN KEY (vehicle_user_id) REFERENCES users(id),
    FOREIGN KEY (driver_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 17. LEAVE TASKS
-- ===============================
CREATE TABLE IF NOT EXISTS leave_tasks (
    task_id BIGINT PRIMARY KEY,
    leave_type ENUM('CASUAL','MEDICAL','ON_DUTY') NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 18. ON-DUTY COUPONS
-- ===============================
CREATE TABLE IF NOT EXISTS on_duty_coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    minutes INT NOT NULL,
    valid_until DATE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 19. TASK CLOSURES
-- ===============================
CREATE TABLE IF NOT EXISTS task_closures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    method ENUM('MANUAL','OTP','QR','RFID','ATTENDANCE','SURVEY','PHOTO','DOCUMENT','SYSTEM') NOT NULL,
    status ENUM('PENDING','VERIFIED','FAILED') DEFAULT 'PENDING',
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 20. SCORE HISTORY
-- ===============================
CREATE TABLE IF NOT EXISTS score_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    score INT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 21. PENALTY HISTORY
-- ===============================
CREATE TABLE IF NOT EXISTS penalty_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    penalty INT NOT NULL,
    reason TEXT NOT NULL,
    imposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
) ENGINE=InnoDB;

-- ===============================
-- 22. NOTIFICATIONS
-- ===============================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 23. ACTION LOGS (BUSINESS)
-- ===============================
CREATE TABLE IF NOT EXISTS action_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 24. DOCUMENTS
-- ===============================
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 25. PERMISSIONS
-- ===============================
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- ===============================
-- 26. AUTH IDENTITIES
-- ===============================
CREATE TABLE IF NOT EXISTS auth_identities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    -- single row per user: store both password and google identifiers here
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(255) NULL,
    is_google BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_identity (user_id),
    UNIQUE KEY uniq_google_id (google_id),
    INDEX idx_auth_email (email),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- (auth_passwords removed; password_hash moved into auth_identities)

-- ===============================
-- 28. USER SESSIONS
-- ===============================
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    identity_id BIGINT NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (identity_id) REFERENCES auth_identities(id)
) ENGINE=InnoDB;

-- ===============================
-- 29. AUTH TOKENS
-- ===============================
CREATE TABLE IF NOT EXISTS auth_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    token_type ENUM('ACCESS','REFRESH') NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES user_sessions(id)
) ENGINE=InnoDB;

-- ===============================
-- 30. PASSWORD RESET TOKENS
-- ===============================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identity_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (identity_id) REFERENCES auth_identities(id)
) ENGINE=InnoDB;

-- ===============================
-- 31. PASSWORD CHANGE LOGS
-- ===============================
CREATE TABLE IF NOT EXISTS password_change_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    identity_id BIGINT NOT NULL,
    changed_by BIGINT NOT NULL,
    ip_address VARCHAR(45),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (identity_id) REFERENCES auth_identities(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ===============================
-- 32. LOGIN HISTORY
-- ===============================
CREATE TABLE IF NOT EXISTS login_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    identity_id BIGINT NOT NULL,
    session_id BIGINT,
    login_method ENUM('PASSWORD','GOOGLE','SSO') NOT NULL,
    status ENUM('SUCCESS','FAILURE') NOT NULL,
    failure_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (identity_id) REFERENCES auth_identities(id),
    FOREIGN KEY (session_id) REFERENCES user_sessions(id)
) ENGINE=InnoDB;

-- ===============================
-- 33. SECURITY EVENTS
-- ===============================
CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    event_type ENUM('LOGIN_FAILURE','TOKEN_REVOKED','PASSWORD_RESET','SESSION_EXPIRED','SUSPICIOUS_ACTIVITY') NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
-- ===============================
-- VIEWS
-- ===============================
CREATE OR REPLACE VIEW user_profile AS
SELECT u.*,
       ai.email as primary_email,
       ai.is_verified as email_verified,
       ai.provider as auth_provider
FROM users u
LEFT JOIN auth_identities ai
  ON ai.user_id = u.id AND ai.is_primary = TRUE;


-- ===============================
-- 34. SYSTEM LOGS
-- ===============================
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('INFO','WARN','ERROR','CRITICAL') NOT NULL,
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
