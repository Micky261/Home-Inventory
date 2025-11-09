-- Migration: Add additional file field
-- Date: 2025-01-09
-- Description: Adds fields for storing additional files (like datasheets, supports both file upload and URL)

ALTER TABLE items ADD COLUMN weitere_datei_type TEXT;
ALTER TABLE items ADD COLUMN weitere_datei_value TEXT;
