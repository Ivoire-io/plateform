const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabase = createClient(
  "https://qgeypminloamvsharktl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZXlwbWlubG9hbXZzaGFya3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM1ODkzMiwiZXhwIjoyMDgwOTM0OTMyfQ.gwfkj4xyv2J8TapgnPL1Wn3H4BLpfAY-VCofsUf5-Cg"
);

const sql = fs.readFileSync("./supabase/migrations/001_initial_schema.sql", "utf8");

// Split into individual statements
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 10 && !s.startsWith("--"));

async function run() {
  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ";";
    const firstLine = stmt.split("\n").find((l) => l.trim().length > 0) || "";
    console.log(`\n[${i + 1}/${statements.length}] ${firstLine.trim().substring(0, 80)}...`);

    const { error } = await supabase.rpc("exec_sql", { query: stmt });
    if (error) {
      // Try via management API (pg_query)
      const res = await fetch(
        "https://qgeypminloamvsharktl.supabase.co/rest/v1/rpc/exec_sql",
        {
          method: "POST",
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZXlwbWlubG9hbXZzaGFya3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM1ODkzMiwiZXhwIjoyMDgwOTM0OTMyfQ.gwfkj4xyv2J8TapgnPL1Wn3H4BLpfAY-VCofsUf5-Cg",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZXlwbWlubG9hbXZzaGFya3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTM1ODkzMiwiZXhwIjoyMDgwOTM0OTMyfQ.gwfkj4xyv2J8TapgnPL1Wn3H4BLpfAY-VCofsUf5-Cg",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: stmt }),
        }
      );
      if (res.ok) {
        console.log("  ✅ OK (via REST)");
      } else {
        const body = await res.text();
        console.log(`  ❌ Error: ${body.substring(0, 200)}`);
      }
    } else {
      console.log("  ✅ OK");
    }
  }

  console.log("\n✨ Migration complete.");
}

run().catch(console.error);
