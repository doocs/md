DELETE FROM emoji_items WHERE pack_id = 'system-coolapk';
DELETE FROM emoji_packs WHERE id = 'system-coolapk';

INSERT INTO emoji_packs (
  id, owner_user_id, kind, slug, name, source_url, source_commit,
  license_spdx, license_url, attribution, description, created_at, updated_at
) VALUES (
  'system-default', NULL, 'system', 'default', 'Built-in',
  NULL, NULL, NULL, NULL, NULL, NULL,
  1785547610000, 1785547610000
) ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  source_url = NULL,
  source_commit = NULL,
  license_spdx = NULL,
  license_url = NULL,
  attribution = NULL,
  description = NULL,
  updated_at = excluded.updated_at;
