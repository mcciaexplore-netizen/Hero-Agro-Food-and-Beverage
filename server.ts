import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("survey.db");
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_WEBAPP_URL;

// Initialize database
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      googleSheetConfigured: !!GOOGLE_SHEET_URL,
      nodeVersion: process.version
    });
  });

  app.post("/api/survey", async (req, res) => {
    try {
      const data = req.body;
      console.log("Received survey data for:", data.name);
      
      // 1. Save to SQLite (Local Backup)
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
        console.log("Saved to local SQLite backup");
      } catch (sqliteError) {
        console.warn("SQLite save failed (expected on read-only filesystems like Vercel):", sqliteError);
      }
      
      // 2. Forward to Google Sheets
      if (GOOGLE_SHEET_URL) {
        console.log("Forwarding to Google Sheets...");
        try {
          const sheetResponse = await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
          });
          
          if (!sheetResponse.ok) {
            throw new Error(`Google Sheets responded with status: ${sheetResponse.status}`);
          }
          
          console.log("Successfully synced with Google Sheets");
        } catch (err) {
          console.error("Google Sheets sync failed:", err);
        }
      } else {
        console.warn("GOOGLE_SHEET_WEBAPP_URL not configured");
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
      
      // Try fetching from Google Sheets first for real-time data
      if (GOOGLE_SHEET_URL) {
        const response = await fetch(GOOGLE_SHEET_URL);
        if (response.ok) {
          rawData = await response.json();
        }
      }

      // Fallback to SQLite if Google Sheets fails or is empty
      if (rawData.length === 0) {
        rawData = db.prepare("SELECT * FROM responses ORDER BY created_at DESC").all();
      }

      // Perform Analytics
      const total = rawData.length;
      const brandShare: Record<string, number> = {};
      const painPoints: Record<string, number> = {};
      const areaSpend: Record<string, { total: number, count: number }> = {};
      const typeDist: Record<string, number> = { Household: 0, 'Shop / Retailer': 0, Other: 0 };

      rawData.forEach(r => {
        // Market Share
        const brand = r.current_brand || r.current_brand_ || "Unknown";
        brandShare[brand] = (brandShare[brand] || 0) + 1;

        // Pain Points
        const problems = typeof r.pain_points === 'string' ? r.pain_points.split(', ') : 
                        (typeof r.problems === 'string' ? JSON.parse(r.problems) : []);
        problems.forEach((p: string) => {
          painPoints[p] = (painPoints[p] || 0) + 1;
        });

        // Locality Spend
        const area = r.locality || r.area;
        const spend = parseFloat(r.monthly_spend || r.monthly_20l || 0);
        if (area) {
          if (!areaSpend[area]) areaSpend[area] = { total: 0, count: 0 };
          areaSpend[area].total += spend;
          areaSpend[area].count += 1;
        }

        // Distribution
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
        raw: rawData.slice(0, 50) // Return last 50 for the table
      };

      res.json(analytics);
    } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
