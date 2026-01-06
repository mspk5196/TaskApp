/*
 Navicat Premium Dump SQL

 Source Server         : TiDB Cloud
 Source Server Type    : MySQL
 Source Server Version : 80011 (8.0.11-TiDB-v7.5.2-serverless)
 Source Host           : gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
 Source Schema         : TaskApp

 Target Server Type    : MySQL
 Target Server Version : 80011 (8.0.11-TiDB-v7.5.2-serverless)
 File Encoding         : 65001

 Date: 06/01/2026 10:08:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for action_logs
-- ----------------------------
DROP TABLE IF EXISTS `action_logs`;
CREATE TABLE `action_logs`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `entity_id` bigint(20) NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `metadata` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for auth_identities
-- ----------------------------
DROP TABLE IF EXISTS `auth_identities`;
CREATE TABLE `auth_identities`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `is_google` tinyint(1) NULL DEFAULT 0,
  `is_primary` tinyint(1) NULL DEFAULT 0,
  `is_verified` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_user_identity`(`user_id` ASC) USING BTREE,
  UNIQUE INDEX `uniq_google_id`(`google_id` ASC) USING BTREE,
  INDEX `idx_auth_email`(`email` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for auth_tokens
-- ----------------------------
DROP TABLE IF EXISTS `auth_tokens`;
CREATE TABLE `auth_tokens`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `session_id` bigint(20) NOT NULL,
  `token_type` enum('ACCESS','REFRESH') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`session_id`) REFERENCES `user_sessions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for calendar_change_requests
-- ----------------------------
DROP TABLE IF EXISTS `calendar_change_requests`;
CREATE TABLE `calendar_change_requests`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `calendar_slot_id` bigint(20) NOT NULL,
  `requested_by` bigint(20) NOT NULL,
  `change_type` enum('MOVE','CANCEL','DELEGATE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'PENDING',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`calendar_slot_id` ASC) USING BTREE,
  INDEX `fk_2`(`requested_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`calendar_slot_id`) REFERENCES `calendar_slots` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for calendar_slots
-- ----------------------------
DROP TABLE IF EXISTS `calendar_slots`;
CREATE TABLE `calendar_slots`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `slot_type` enum('TASK','LEAVE','ON_DUTY','BLOCK') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('RESERVED','ACTIVE','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'RESERVED',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for daily_acknowledgements
-- ----------------------------
DROP TABLE IF EXISTS `daily_acknowledgements`;
CREATE TABLE `daily_acknowledgements`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `date` date NOT NULL,
  `acknowledged` tinyint(1) NULL DEFAULT 0,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_user_date`(`user_id` ASC, `date` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for documents
-- ----------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `uploaded_by` bigint(20) NOT NULL,
  `document_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `file_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `approved` tinyint(1) NULL DEFAULT 0,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`task_id` ASC) USING BTREE,
  INDEX `fk_2`(`uploaded_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for escalations
-- ----------------------------
DROP TABLE IF EXISTS `escalations`;
CREATE TABLE `escalations`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `from_user_id` bigint(20) NOT NULL,
  `to_user_id` bigint(20) NOT NULL,
  `escalation_level` int(11) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`task_id` ASC) USING BTREE,
  INDEX `fk_2`(`from_user_id` ASC) USING BTREE,
  INDEX `fk_3`(`to_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for infrastructure_mappings
-- ----------------------------
DROP TABLE IF EXISTS `infrastructure_mappings`;
CREATE TABLE `infrastructure_mappings`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `infra_user_id` bigint(20) NOT NULL,
  `owner_user_id` bigint(20) NOT NULL,
  `active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`infra_user_id` ASC) USING BTREE,
  INDEX `fk_2`(`owner_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`infra_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for leave_tasks
-- ----------------------------
DROP TABLE IF EXISTS `leave_tasks`;
CREATE TABLE `leave_tasks`  (
  `task_id` bigint(20) NOT NULL,
  `leave_type` enum('CASUAL','MEDICAL','ON_DUTY') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `approved` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`task_id`) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for login_history
-- ----------------------------
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `identity_id` bigint(20) NOT NULL,
  `session_id` bigint(20) NULL DEFAULT NULL,
  `login_method` enum('PASSWORD','GOOGLE','SSO') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('SUCCESS','FAILURE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `failure_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `occurred_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`identity_id` ASC) USING BTREE,
  INDEX `fk_3`(`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`identity_id`) REFERENCES `auth_identities` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`session_id`) REFERENCES `user_sessions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for meeting_roles
-- ----------------------------
DROP TABLE IF EXISTS `meeting_roles`;
CREATE TABLE `meeting_roles`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `meeting_user_id` bigint(20) NOT NULL,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `prerequisite_task_id` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`meeting_user_id` ASC) USING BTREE,
  INDEX `fk_2`(`prerequisite_task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`meeting_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`prerequisite_task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reference_id` bigint(20) NULL DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for on_duty_coupons
-- ----------------------------
DROP TABLE IF EXISTS `on_duty_coupons`;
CREATE TABLE `on_duty_coupons`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `minutes` int(11) NOT NULL,
  `valid_until` date NOT NULL,
  `used` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for ownership_transfers
-- ----------------------------
DROP TABLE IF EXISTS `ownership_transfers`;
CREATE TABLE `ownership_transfers`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `entity_user_id` bigint(20) NOT NULL,
  `old_owner_id` bigint(20) NOT NULL,
  `new_owner_id` bigint(20) NOT NULL,
  `status` enum('PENDING','ACCEPTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'PENDING',
  `transferred_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`entity_user_id` ASC) USING BTREE,
  INDEX `fk_2`(`old_owner_id` ASC) USING BTREE,
  INDEX `fk_3`(`new_owner_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`entity_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`old_owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`new_owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for password_change_logs
-- ----------------------------
DROP TABLE IF EXISTS `password_change_logs`;
CREATE TABLE `password_change_logs`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `identity_id` bigint(20) NOT NULL,
  `changed_by` bigint(20) NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`identity_id` ASC) USING BTREE,
  INDEX `fk_2`(`changed_by` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`identity_id`) REFERENCES `auth_identities` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `identity_id` bigint(20) NOT NULL,
  `token_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`identity_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`identity_id`) REFERENCES `auth_identities` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for penalty_history
-- ----------------------------
DROP TABLE IF EXISTS `penalty_history`;
CREATE TABLE `penalty_history`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `penalty` int(11) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `imposed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for recurring_task_instances
-- ----------------------------
DROP TABLE IF EXISTS `recurring_task_instances`;
CREATE TABLE `recurring_task_instances`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_task_id` bigint(20) NOT NULL,
  `instance_date` date NOT NULL,
  `task_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`parent_task_id` ASC) USING BTREE,
  INDEX `fk_2`(`task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for score_history
-- ----------------------------
DROP TABLE IF EXISTS `score_history`;
CREATE TABLE `score_history`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `task_id` bigint(20) NOT NULL,
  `score` int(11) NOT NULL,
  `awarded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for security_events
-- ----------------------------
DROP TABLE IF EXISTS `security_events`;
CREATE TABLE `security_events`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NULL DEFAULT NULL,
  `event_type` enum('LOGIN_FAILURE','TOKEN_REVOKED','PASSWORD_RESET','SESSION_EXPIRED','SUSPICIOUS_ACTIVITY') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for system_logs
-- ----------------------------
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `log_level` enum('INFO','WARN','ERROR','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `context` json NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for task_assignments
-- ----------------------------
DROP TABLE IF EXISTS `task_assignments`;
CREATE TABLE `task_assignments`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `assignee_id` bigint(20) NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'PENDING',
  `response_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `responded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`task_id` ASC) USING BTREE,
  INDEX `fk_2`(`assignee_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for task_closures
-- ----------------------------
DROP TABLE IF EXISTS `task_closures`;
CREATE TABLE `task_closures`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `method` enum('MANUAL','OTP','QR','RFID','ATTENDANCE','SURVEY','PHOTO','DOCUMENT','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('PENDING','VERIFIED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'PENDING',
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for task_dependencies
-- ----------------------------
DROP TABLE IF EXISTS `task_dependencies`;
CREATE TABLE `task_dependencies`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_task_id` bigint(20) NOT NULL,
  `child_task_id` bigint(20) NOT NULL,
  `dependency_type` enum('SEQUENTIAL','PARALLEL') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`parent_task_id` ASC) USING BTREE,
  INDEX `fk_2`(`child_task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`child_task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for task_time_rules
-- ----------------------------
DROP TABLE IF EXISTS `task_time_rules`;
CREATE TABLE `task_time_rules`  (
  `task_id` bigint(20) NOT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `fixed_start_time` time NULL DEFAULT NULL,
  `fixed_end_time` time NULL DEFAULT NULL,
  `daily_quota_minutes` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`task_id`) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_task_id` bigint(20) NULL DEFAULT NULL,
  `task_type` enum('FIXED','DATE_ONLY','FLOATING','SUBSCRIPTION','RECURRING','BIDDING','PACKAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `creator_id` bigint(20) NOT NULL,
  `score` int(11) NULL DEFAULT 0,
  `penalty` int(11) NULL DEFAULT 0,
  `penalty_per_hour` int(11) NULL DEFAULT 0,
  `closing_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `start_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `is_mandatory` tinyint(1) NULL DEFAULT 0,
  `place_requirement` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `status` enum('CREATED','SENT','PENDING_ACCEPTANCE','ACCEPTED','CALENDAR_PLACED','IN_PROGRESS','PAUSED','COMPLETED','PENDING_APPROVAL','CLOSED','OVERDUE','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'CREATED',
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `due_date` date NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`owner_id` ASC) USING BTREE,
  INDEX `fk_2`(`creator_id` ASC) USING BTREE,
  INDEX `fk_3`(`parent_task_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_3` FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for temporary_acceptances
-- ----------------------------
DROP TABLE IF EXISTS `temporary_acceptances`;
CREATE TABLE `temporary_acceptances`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `task_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `approved` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`task_id` ASC) USING BTREE,
  INDEX `fk_2`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for user_categories
-- ----------------------------
DROP TABLE IF EXISTS `user_categories`;
CREATE TABLE `user_categories`  (
  `id` tinyint(4) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role_user_id` bigint(20) NOT NULL,
  `owner_user_id` bigint(20) NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT 'PENDING',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accepted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`role_user_id` ASC) USING BTREE,
  INDEX `fk_2`(`owner_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`role_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `identity_id` bigint(20) NOT NULL,
  `device_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `device_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`user_id` ASC) USING BTREE,
  INDEX `fk_2`(`identity_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`identity_id`) REFERENCES `auth_identities` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for user_subcategories
-- ----------------------------
DROP TABLE IF EXISTS `user_subcategories`;
CREATE TABLE `user_subcategories`  (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `category_id` tinyint(4) NOT NULL,
  `code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_cat_code`(`category_id` ASC, `code` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`category_id`) REFERENCES `user_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `category_id` tinyint(4) NOT NULL,
  `subcategory_id` smallint(6) NULL DEFAULT NULL,
  `user_type` enum('HUMAN','ROLE','INFRASTRUCTURE','ACTIVITY') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `subtype` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL,
  `owner_id` bigint(20) NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `score` int(11) NULL DEFAULT 0,
  `reports_to` bigint(20) NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_users_email`(`email` ASC) USING BTREE,
  INDEX `fk_1`(`reports_to` ASC) USING BTREE,
  INDEX `fk_users_owner`(`owner_id` ASC) USING BTREE,
  INDEX `fk_users_category`(`category_id` ASC) USING BTREE,
  INDEX `fk_users_subcategory`(`subcategory_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`reports_to`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_users_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_users_category` FOREIGN KEY (`category_id`) REFERENCES `user_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_users_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `user_subcategories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 30001 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for vehicle_assignments
-- ----------------------------
DROP TABLE IF EXISTS `vehicle_assignments`;
CREATE TABLE `vehicle_assignments`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `vehicle_user_id` bigint(20) NOT NULL,
  `driver_user_id` bigint(20) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_1`(`vehicle_user_id` ASC) USING BTREE,
  INDEX `fk_2`(`driver_user_id` ASC) USING BTREE,
  CONSTRAINT `fk_1` FOREIGN KEY (`vehicle_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_2` FOREIGN KEY (`driver_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Compact;

-- ----------------------------
-- View structure for user_profile
-- ----------------------------
DROP VIEW IF EXISTS `user_profile`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `user_profile` AS SELECT `TaskApp`.`u`.`id` AS `id`,`TaskApp`.`u`.`user_type` AS `user_type`,`TaskApp`.`u`.`subtype` AS `subtype`,`TaskApp`.`u`.`name` AS `name`,`TaskApp`.`u`.`email` AS `email`,`TaskApp`.`u`.`is_active` AS `is_active`,`TaskApp`.`u`.`score` AS `score`,`TaskApp`.`u`.`reports_to` AS `reports_to`,`TaskApp`.`u`.`created_at` AS `created_at`,`ai`.`email` AS `primary_email`,`ai`.`is_verified` AS `email_verified`,CASE WHEN `ai`.`is_google` THEN _UTF8MB4'GOOGLE' ELSE _UTF8MB4'PASSWORD' END AS `auth_provider` FROM `TaskApp`.`users` AS `u` LEFT JOIN `TaskApp`.`auth_identities` AS `ai` ON `ai`.`user_id`=`u`.`id` AND `ai`.`is_primary`=TRUE WITH CASCADED CHECK OPTION;

SET FOREIGN_KEY_CHECKS = 1;
