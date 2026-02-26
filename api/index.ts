import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_WEBAPP_URL;

// Initialize database (Optional backup)
let db: any;
try {
  const dbPath = process.env.VERCEL ? "/tmp/survey.db" : "survey.db";
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      mobile TEXT,
      area TEXT,
      type TEXT,
      other_type TEXT,
      water_types TEXT,
      other_water_type TEXT,
      current_brand TEXT,
      price_20l TEXT,
      price_1l TEXT,
      price_500ml TEXT,
      monthly_20l TEXT,
      daily_bottles TEXT,
      problems TEXT,
      switching_reasons TEXT,
      cheaper_switch TEXT,
      retailer_fastest_size TEXT,
      retailer_margin TEXT,
      retailer_credit TEXT,
      retailer_try_hero_agro_foods TEXT,
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (err) {
  console.warn("Database initialization failed (Expected on some serverless environments):", err.message);
}

app.use(express.json());

// API routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    googleSheetConfigured: !!GOOGLE_SHEET_URL,
    nodeVersion: process.version,
    env: process.env.NODE_ENV
  });
});

app.post("/api/survey", async (req, res) => {
  try {
    const data = req.body;
    console.log("Received survey data for:", data.name);
    
    // 1. Save to SQLite (Local Backup)
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO responses (
            name, mobile, area, type, other_type, water_types, other_water_type,
            current_brand, price_20l, price_1l, price_500ml, monthly_20l, daily_bottles,
            problems, switching_reasons, cheaper_switch, retailer_fastest_size, retailer_margin,
            retailer_credit, retailer_try_hero_agro_foods, comments
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          data.name || "", data.mobile || "", data.area || "", data.type || "Household", data.otherType || "",
          JSON.stringify(data.waterTypes || []), data.otherWaterType || "",
          data.currentBrand || "", data.price20l || "", data.price1l || "", data.price500ml || "",
          data.monthly20l || "", data.dailyBottles || "", JSON.stringify(data.problems || []),
          JSON.stringify(data.switchingReasons || []), data.cheaperSwitch || "",
          data.retailerFastestSize || "", data.retailerMargin || "", data.retailerCredit || "",
          data.retailerTryHeroAgroFoods || "", data.comments || ""
        );
      } catch (sqliteError) {
        console.warn("SQLite save skipped:", sqliteError.message);
      }
    }
    
    // 2. Forward to Google Sheets
    if (GOOGLE_SHEET_URL) {
      try {
        const sheetResponse = await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" }
        });
        
        if (!sheetResponse.ok) {
          throw new Error(`Google Sheets error: ${sheetResponse.status}`);
        }
      } catch (err) {
        console.error("Google Sheets sync failed:", err);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Survey submission error:", error);
    res.status(500).json({ error: "Failed to process survey" });
  }
});

app.get("/api/responses", async (req, res) => {
  try {
    let rawData: any[] = [];
    if (GOOGLE_SHEET_URL) {
      const response = await fetch(GOOGLE_SHEET_URL);
      if (response.ok) {
        rawData = await response.json();
      }
    }

    if (rawData.length === 0 && db) {
      rawData = db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();
    }

    const total = rawData.length;
    const brandShare: Record<string, number> = {};
    const painPoints: Record<string, number> = {};
    const areaSpend: Record<string, { total: number, count: number }> = {};
    const typeDist: Record<string, number> = { Household: 0, 'Shop / Retailer': 0, Other: 0 };

    rawData.forEach(r => {
      const brand = r.current_brand || r.current_brand_ || "Unknown";
      brandShare[brand] = (brandShare[brand] || 0) + 1;

      const problems = typeof r.pain_points === 'string' ? r.pain_points.split(', ') : 
                      (typeof r.problems === 'string' ? JSON.parse(r.problems) : []);
      problems.forEach((p: string) => {
        painPoints[p] = (painPoints[p] || 0) + 1;
      });

      const area = r.locality || r.area;
      const spend = parseFloat(r.monthly_spend || r.monthly_20l || 0);
      if (area) {
        if (!areaSpend[area]) areaSpend[area] = { total: 0, count: 0 };
        areaSpend[area].total += spend;
        areaSpend[area].count += 1;
      }

      const type = r.respondent_type || r.type;
      if (type) typeDist[type] = (typeDist[type] || 0) + 1;
    });

    const analytics = {
      total,
      marketShare: Object.entries(brandShare)
        .map(([name, count]) => ({ name, percentage: ((count / total) * 100).toFixed(1) }))
        .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)),
      topPainPoints: Object.entries(painPoints)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      localityAnalysis: Object.entries(areaSpend).map(([area, data]) => ({
        area,
        avgSpend: (data.total / data.count).toFixed(2)
      })),
      distribution: typeDist,
      raw: rawData.slice(0, 50)
    };

    res.json(analytics);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve from dist
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  setupVite().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // On Vercel, we still need to serve static files if it's not an API route
  setupVite();
}

export default app;
