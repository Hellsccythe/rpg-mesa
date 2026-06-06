-- Sprint 2: passive_skills, signature_skill e signature_skill_nivel em classes
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS passive_skills      TEXT[],
  ADD COLUMN IF NOT EXISTS signature_skill     TEXT,
  ADD COLUMN IF NOT EXISTS signature_skill_nivel INTEGER;
