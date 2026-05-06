-- Run this in Supabase SQL Editor BEFORE re-running the import script.
-- Adds a unique constraint on name for each table so re-running the
-- import script never creates duplicates.

ALTER TABLE schools          ADD CONSTRAINT schools_name_key          UNIQUE (name);
ALTER TABLE daycares         ADD CONSTRAINT daycares_name_key         UNIQUE (name);
ALTER TABLE learning_centers ADD CONSTRAINT learning_centers_name_key UNIQUE (name);
ALTER TABLE playgrounds      ADD CONSTRAINT playgrounds_name_key      UNIQUE (name);
ALTER TABLE clinics          ADD CONSTRAINT clinics_name_key          UNIQUE (name);
ALTER TABLE cafes             ADD CONSTRAINT cafes_name_key           UNIQUE (name);
ALTER TABLE mini_zoo         ADD CONSTRAINT mini_zoo_name_key         UNIQUE (name);
ALTER TABLE swimming_pools   ADD CONSTRAINT swimming_pools_name_key   UNIQUE (name);
ALTER TABLE bookstores       ADD CONSTRAINT bookstores_name_key       UNIQUE (name);
ALTER TABLE others           ADD CONSTRAINT others_name_key           UNIQUE (name);
