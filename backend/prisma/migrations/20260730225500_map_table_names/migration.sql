-- Rename Tables to Plural Lowercase Standard SQL Database Names
ALTER TABLE IF EXISTS "User" RENAME TO "users";
ALTER TABLE IF EXISTS "RefreshToken" RENAME TO "refresh_tokens";
ALTER TABLE IF EXISTS "SocialAccount" RENAME TO "social_accounts";
ALTER TABLE IF EXISTS "BrandKit" RENAME TO "brand_kits";
ALTER TABLE IF EXISTS "BrandAsset" RENAME TO "brand_assets";
ALTER TABLE IF EXISTS "Category" RENAME TO "categories";
ALTER TABLE IF EXISTS "Festival" RENAME TO "festivals";
ALTER TABLE IF EXISTS "DesignStyle" RENAME TO "design_styles";
ALTER TABLE IF EXISTS "Template" RENAME TO "templates";
ALTER TABLE IF EXISTS "Post" RENAME TO "posts";
ALTER TABLE IF EXISTS "Caption" RENAME TO "captions";
ALTER TABLE IF EXISTS "ScheduledPost" RENAME TO "scheduled_posts";
ALTER TABLE IF EXISTS "VaultItem" RENAME TO "vault_items";
ALTER TABLE IF EXISTS "Subscription" RENAME TO "subscriptions";
ALTER TABLE IF EXISTS "Notification" RENAME TO "notifications";
