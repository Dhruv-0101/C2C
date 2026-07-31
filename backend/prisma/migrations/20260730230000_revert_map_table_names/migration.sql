-- Rename Tables Back to PascalCase Standard Prisma Model Names
ALTER TABLE IF EXISTS "users" RENAME TO "User";
ALTER TABLE IF EXISTS "refresh_tokens" RENAME TO "RefreshToken";
ALTER TABLE IF EXISTS "social_accounts" RENAME TO "SocialAccount";
ALTER TABLE IF EXISTS "brand_kits" RENAME TO "BrandKit";
ALTER TABLE IF EXISTS "brand_assets" RENAME TO "BrandAsset";
ALTER TABLE IF EXISTS "categories" RENAME TO "Category";
ALTER TABLE IF EXISTS "festivals" RENAME TO "Festival";
ALTER TABLE IF EXISTS "design_styles" RENAME TO "DesignStyle";
ALTER TABLE IF EXISTS "templates" RENAME TO "Template";
ALTER TABLE IF EXISTS "posts" RENAME TO "Post";
ALTER TABLE IF EXISTS "captions" RENAME TO "Caption";
ALTER TABLE IF EXISTS "scheduled_posts" RENAME TO "ScheduledPost";
ALTER TABLE IF EXISTS "vault_items" RENAME TO "VaultItem";
ALTER TABLE IF EXISTS "subscriptions" RENAME TO "Subscription";
ALTER TABLE IF EXISTS "notifications" RENAME TO "Notification";
