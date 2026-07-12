import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
   const body = await req.json()

const {
  winnerEmail,
  loserEmail,
  winnerName,
  loserName,
  winnerScore,
  loserScore,
  action,
  testEmail,
} = body
if (action === "weekly") {
  const { data: rankings, error } = await supabase
    .from("players")
    .select("id, name, played, won, lost, points")
    .gt("played", 0)
    .order("points", { ascending: false })

  if (error) {
    throw error
  }
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

const { data: matches, error: matchesError } = await supabase
  .from("matches")
  .select("player_a, player_b, created_at")
  .gte("created_at", sevenDaysAgo.toISOString())
  .order("created_at", { ascending: false })

if (matchesError) {
  throw matchesError
}
const { data: allPlayers } = await supabase
  .from("players")
  .select("id, name")
  const playerNameById = new Map(
  allPlayers?.map((player) => [player.id, player.name]) ?? [],
)

const matchLines = matches?.map((match) => {
  const playerAName = playerNameById.get(match.player_a) ?? "Unknown player"
  const playerBName = playerNameById.get(match.player_b) ?? "Unknown player"

  return `${playerAName} played ${playerBName}`
}) ?? []
const { data: recipients, error: recipientsError } = await supabase
  .from("players")
  .select("email, name")
  .eq("receive_weekly_emails", true)
  .ilike("email", "%@%")

if (recipientsError) {
  throw recipientsError
}

const rankingLines = rankings?.map((player, index) => {
  return `${index + 1}. ${player.name} - ${player.points} points (${player.played} played)`
}) ?? []

const { data: allMatches, error: allMatchesError } = await supabase
  .from("matches")
  .select("player_a, player_b")

if (allMatchesError) {
  throw allMatchesError
}

const playedPairs = new Set(
  (allMatches ?? []).map((m) => [m.player_a, m.player_b].sort().join("|"))
)

const pairingLines = (rankings ?? []).map((player) => {
  const suggestions = (rankings ?? [])
    .filter((opponent) => opponent.id !== player.id)
    .filter((opponent) => !playedPairs.has([player.id, opponent.id].sort().join("|")))
    .sort((a, b) => Math.abs(a.points - player.points) - Math.abs(b.points - player.points))
    .slice(0, 1)
    .map((opponent) => opponent.name)

  if (suggestions.length === 0) {
    return null
  }
  return `${player.name} - you haven't yet played ${suggestions[0]}. Why not contact them?`
}).filter((line) => line !== null)

const emailText = `
Napton Tennis Ladder Weekly Report

Current Rankings

${rankingLines.length > 0 ? rankingLines.join("\n") : "No players have played yet."}

Matches This Week

${matchLines.length > 0 ? matchLines.join("\n") : "No matches were played this week."}

Suggested Matches (players you haven't faced yet)

${pairingLines.length > 0 ? pairingLines.join("\n") : "Everyone has played everyone on the ladder — nice work!"}

You are receiving this email because you joined the Napton and Priors tennis ladder.
To stop receiving these emails, log into the ladder, go to Player Contacts and untick "Receive Weekly Ladder Reports".
View the full ladder at https://www.naptontennisladder.co.uk
`
 const recipientEmails = testEmail ? [testEmail] : recipients.map(r => r.email)

const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Napton Tennis Ladder <results@naptontennisladder.co.uk>",
    to: recipientEmails,
    subject: "Napton Tennis Ladder Weekly Report",
    text: emailText,
  }),
})

const resultText = await resendResponse.text()

return new Response(resultText, {
  status: resendResponse.status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
  },
})

  
}
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       from: "Napton Tennis Ladder <results@naptontennisladder.co.uk>",
        to: [winnerEmail, loserEmail],
        subject: "Napton Tennis Ladder Match Result",
        text: `
Napton Tennis Ladder

Match Result Recorded

Winner: ${winnerName}
Loser: ${loserName}

Score:
${winnerScore} - ${loserScore}

This result has been recorded on the ladder.
        `,
      }),
    })

    const resultText = await resendResponse.text()

    return new Response(resultText, {
      status: resendResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})