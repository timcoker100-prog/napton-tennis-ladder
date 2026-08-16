-- Prevent the same two players from having more than one match result
-- recorded for the same day. This is a backstop against duplicate
-- submissions (e.g. a double-tap on the submit button) getting through --
-- the app already blocks re-matching the same opponent client-side, but
-- that check races against concurrent inserts, so it isn't reliable on its
-- own.
--
-- LEAST/GREATEST normalise the pair regardless of which player is stored
-- as player_a vs. player_b.
--
-- `created_at::date` isn't allowed in an index expression because a
-- timestamptz -> date cast depends on the session's TimeZone setting
-- (STABLE, not IMMUTABLE). Converting via `AT TIME ZONE interval '0'`
-- instead is a fixed numeric shift to UTC, which Postgres treats as
-- IMMUTABLE -- and UTC matches how the app itself computes "today"
-- (`new Date().toISOString()` is always UTC).
--
-- Note: this does not filter on `status`/`confirmed` -- it blocks a second
-- row for the same pair on the same day no matter what state the first one
-- is in. If pending/rejected matches should be allowed to coexist with a
-- resubmission on the same day, this needs a partial index instead
-- (e.g. `where status = 'confirmed'`).
create unique index if not exists matches_unique_pair_per_day
  on matches (
    least(player_a, player_b),
    greatest(player_a, player_b),
    ((created_at at time zone interval '0')::date)
  );
