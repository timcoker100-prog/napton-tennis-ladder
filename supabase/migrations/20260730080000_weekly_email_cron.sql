-- Schedule the weekly ladder report email (quick-worker, action: "weekly").
-- Runs the check every hour on the hour, but only actually sends when it's
-- Monday 8am Europe/London time -- this avoids drifting an hour off during
-- the BST/GMT clock change, which a fixed "0 8 * * 1" UTC schedule would.
--
-- The service role key used to call the function is read from Supabase Vault
-- at run time (secret name: quick_worker_service_role_key). Create that
-- secret once via the SQL Editor -- see supabase/migrations/README.md.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'weekly-ladder-report',
  '0 * * * *',
  $$
  select
    case
      when extract(dow from (now() at time zone 'Europe/London')) = 1
       and extract(hour from (now() at time zone 'Europe/London')) = 8
      then net.http_post(
        url := 'https://fblxqfzzgbxtaswedstv.supabase.co/functions/v1/quick-worker',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'quick_worker_service_role_key'
          )
        ),
        body := jsonb_build_object('action', 'weekly')
      )
    end;
  $$
);
