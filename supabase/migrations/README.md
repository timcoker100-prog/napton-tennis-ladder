# One-time setup: weekly email cron secret

The `20260730080000_weekly_email_cron.sql` migration schedules a pg_cron job
that calls the `quick-worker` edge function every Monday at 8am UK time. It
authenticates using the project's service role key, which is stored in
Supabase Vault rather than in this file, so it never ends up in git history.

Run this once in the Supabase SQL Editor for the linked project
(fblxqfzzgbxtaswedstv), after replacing the placeholder with the real
service role key from Project Settings > API > service_role secret:

```sql
select vault.create_secret('REPLACE_WITH_SERVICE_ROLE_KEY', 'quick_worker_service_role_key');
```

If the key ever changes, rotate the vault secret instead of editing the
migration:

```sql
select vault.update_secret(
  (select id from vault.secrets where name = 'quick_worker_service_role_key'),
  'NEW_SERVICE_ROLE_KEY'
);
```
