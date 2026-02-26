import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1NGseGNHv6Tth5e_yuRWzeVczQkzqXXGF4k16IsvyiTE/export?format=csv&gid=0";

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of row) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch the CSV
  const res = await fetch(SHEET_URL);
  const csv = await res.text();

  // Skip the first 3 header rows
  const rows = csv.split("\n").slice(3).filter(Boolean);

  const festivalsRaw = rows
    .map((row) => {
      const cols = parseCSVRow(row);
      const name = cols[0]?.trim();
      if (!name || name.startsWith("#") || name === "") return null;
      return {
        name,
        type: cols[2]?.trim() || null,
        month: cols[3]?.trim() || null,
        deadline: cols[4]?.trim().match(/^\d{4}-\d{2}-\d{2}$/) ? cols[4].trim() : null,
        price: cols[6]?.trim() || null,
        steam_feature: cols[7]?.toLowerCase().includes("yes") ?? false,
        worth_it: cols[8]?.trim() || null,
        description: cols[9]?.trim() || null,
        official_url: cols[10]?.trim() || null,
        steam_url: cols[11]?.trim() || null,
        last_synced: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  // Deduplicate by name, keeping the last occurrence
  const seen = new Map();
  for (const f of festivalsRaw) {
    seen.set(f.name, f);
  }
  const festivals = Array.from(seen.values());

  // Upsert into DB
  const { error } = await supabase
    .from("festivals")
    .upsert(festivals, { onConflict: "name", ignoreDuplicates: false });

  // Log the sync
  await supabase.from("sync_log").insert({
    rows_synced: festivals.length,
    status: error ? "error" : "success",
    error: error ? error.message : null,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message, details: error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ synced: festivals.length, at: new Date().toISOString() }),
    { headers: { "Content-Type": "application/json" } }
  );
});