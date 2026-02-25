-- Migration: Add description and inventory_status to locations
-- inventory_status: 'none' (not inventoried), 'partial' (partially inventoried), 'complete' (fully inventoried)

ALTER TABLE locations ADD COLUMN description TEXT;
ALTER TABLE locations ADD COLUMN inventory_status TEXT DEFAULT 'none';
