CREATE DATABASE IF NOT EXISTS airscribe_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE airscribe_ai;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255) NULL,
  bio TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  theme_mode VARCHAR(20) NOT NULL DEFAULT 'dark',
  brush_color VARCHAR(20) NOT NULL DEFAULT '#23d3ff',
  brush_size INT NOT NULL DEFAULT 6,
  gesture_sensitivity FLOAT NOT NULL DEFAULT 0.2,
  camera_quality VARCHAR(30) NOT NULL DEFAULT '720p',
  auto_recognition TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS drawing_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_name VARCHAR(120) NOT NULL DEFAULT 'Air Session',
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME NULL,
  last_gesture VARCHAR(50) NULL,
  metadata_json JSON NULL,
  CONSTRAINT fk_drawing_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS drawings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  image_path VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(255) NULL,
  svg_markup LONGTEXT NULL,
  canvas_width INT NOT NULL DEFAULT 1280,
  canvas_height INT NOT NULL DEFAULT 720,
  background_style VARCHAR(120) NULL,
  primary_label VARCHAR(80) NULL,
  primary_confidence FLOAT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_drawings_user_id (user_id),
  INDEX idx_drawings_session_id (session_id),
  CONSTRAINT fk_drawings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_drawings_session FOREIGN KEY (session_id) REFERENCES drawing_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS drawing_strokes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drawing_id INT NOT NULL,
  stroke_order INT NOT NULL DEFAULT 0,
  tool_type VARCHAR(30) NOT NULL DEFAULT 'brush',
  color VARCHAR(20) NOT NULL DEFAULT '#23d3ff',
  size INT NOT NULL DEFAULT 6,
  gesture_trigger VARCHAR(50) NULL,
  composite_mode VARCHAR(30) NOT NULL DEFAULT 'source-over',
  started_at DATETIME NULL,
  ended_at DATETIME NULL,
  INDEX idx_drawing_strokes_drawing_id (drawing_id),
  CONSTRAINT fk_drawing_strokes_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS stroke_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stroke_id INT NOT NULL,
  point_order INT NOT NULL DEFAULT 0,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  pressure FLOAT NULL,
  timestamp_ms INT NULL,
  INDEX idx_stroke_points_stroke_id (stroke_id),
  CONSTRAINT fk_stroke_points_stroke FOREIGN KEY (stroke_id) REFERENCES drawing_strokes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS recognized_objects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drawing_id INT NOT NULL,
  label VARCHAR(80) NOT NULL,
  confidence FLOAT NOT NULL,
  bounding_box JSON NULL,
  clean_asset_key VARCHAR(80) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recognized_objects_drawing_id (drawing_id),
  CONSTRAINT fk_recognized_objects_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS gesture_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NULL,
  drawing_id INT NULL,
  gesture_name VARCHAR(50) NOT NULL,
  confidence FLOAT NULL,
  trigger_state VARCHAR(30) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gesture_logs_user_id (user_id),
  INDEX idx_gesture_logs_session_id (session_id),
  INDEX idx_gesture_logs_drawing_id (drawing_id),
  CONSTRAINT fk_gesture_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_gesture_logs_session FOREIGN KEY (session_id) REFERENCES drawing_sessions(id) ON DELETE SET NULL,
  CONSTRAINT fk_gesture_logs_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS saved_exports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drawing_id INT NOT NULL,
  file_format VARCHAR(10) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size_kb FLOAT NULL,
  exported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_saved_exports_drawing_id (drawing_id),
  CONSTRAINT fk_saved_exports_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS ai_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drawing_id INT NOT NULL,
  recognized_object_id INT NULL,
  model_name VARCHAR(120) NOT NULL DEFAULT 'contour-template-v1',
  label VARCHAR(80) NOT NULL,
  confidence FLOAT NOT NULL,
  inference_time_ms INT NULL,
  raw_payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_predictions_drawing_id (drawing_id),
  INDEX idx_ai_predictions_recognized_object_id (recognized_object_id),
  CONSTRAINT fk_ai_predictions_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_predictions_recognized_object FOREIGN KEY (recognized_object_id) REFERENCES recognized_objects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  drawing_id INT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_user_id (user_id),
  INDEX idx_feedback_drawing_id (drawing_id),
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_drawing FOREIGN KEY (drawing_id) REFERENCES drawings(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

