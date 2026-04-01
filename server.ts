import express from "express";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { db } from './src/db';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Shell Execution
  app.post("/api/shell", (req, res) => {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: "No command provided" });

    exec(command, (error, stdout, stderr) => {
      res.json({
        stdout: stdout || "",
        stderr: stderr || "",
        error: error ? error.message : null
      });
    });
  });

  // API Route: Add User
  app.post("/api/users", async (req, res) => {
    const { username, pin, role } = req.body;
    if (!username || !pin) return res.status(400).json({ error: "Username and PIN are required" });

    const pinHash = await bcrypt.hash(pin, 10);
    try {
      const data = await db`
        INSERT INTO users (username, pin_hash, role)
        VALUES (${username}, ${pinHash}, ${role || 'user'})
        RETURNING *
      `;
      res.json({ user: data[0] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Admin - List Users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await db`SELECT * FROM users`;
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Admin - List Agents
  app.get("/api/admin/agents", async (req, res) => {
    try {
      const agents = await db`SELECT * FROM agents`;
      res.json({ agents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Admin - Assign Agent
  app.post("/api/admin/assign-agent", async (req, res) => {
    const { user_id, agent_id } = req.body;
    try {
      await db`
        INSERT INTO user_agents (user_id, agent_id)
        VALUES (${user_id}, ${agent_id})
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Admin - Update PIN Expiry
  app.post("/api/admin/update-pin-expiry", async (req, res) => {
    const { user_id, expiry_date } = req.body;
    try {
      await db`
        UPDATE users
        SET pin_expiry = ${expiry_date}
        WHERE id = ${user_id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Debug - Ensure Settings Table
  app.post("/api/debug/ensure-settings", async (req, res) => {
    try {
      await db`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: User - List Assigned Agents
  app.get("/api/user/agents", async (req, res) => {
    const user_id = req.query.user_id as string;
    try {
      const agents = await db`
        SELECT ua.agent_id, a.*
        FROM user_agents ua
        JOIN agents a ON ua.agent_id = a.id
        WHERE ua.user_id = ${user_id}
      `;
      res.json({ agents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Agents - List All
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await db`SELECT * FROM agents`;
      res.json({ agents });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Agents - Create
  app.post("/api/agents", async (req, res) => {
    const { name, model, memories, skills } = req.body;
    try {
      const [agent] = await db`
        INSERT INTO agents (name, model, memories, skills)
        VALUES (${name}, ${model}, ${memories}, ${skills})
        RETURNING *
      `;
      res.json({ agent });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Agents - Update
  app.put("/api/agents/:id", async (req, res) => {
    const { id } = req.params;
    const { name, model, memories, skills } = req.body;
    try {
      const [agent] = await db`
        UPDATE agents
        SET name = ${name}, model = ${model}, memories = ${memories}, skills = ${skills}
        WHERE id = ${id}
        RETURNING *
      `;
      res.json({ agent });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Agents - Delete
  app.delete("/api/agents/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db`DELETE FROM agents WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Assign Agent to User
  app.post("/api/assign-agent", async (req, res) => {
    const { user_id, agent_id } = req.body;
    try {
      await db`
        INSERT INTO user_agents (user_id, agent_id)
        VALUES (${user_id}, ${agent_id})
        ON CONFLICT (user_id, agent_id) DO NOTHING
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Query
  app.get("/api/query/:table", async (req, res) => {
    const { table } = req.params;
    const { select, eq, order, limit } = req.query;
    let sql = '';
    try {
      // Use db(identifier).toString() to safely quote table names
      const tableName = db(table).toString();
      sql = `SELECT ${select as string || '*'} FROM ${tableName}`;
      const params: any[] = [];
      
      if (eq) {
        const [col, val] = (eq as string).split(',');
        sql += ` WHERE ${db(col).toString()} = $1`;
        params.push(val);
      }
      if (order) {
        const [col, asc] = (order as string).split(',');
        sql += ` ORDER BY ${db(col).toString()} ${asc === 'true' ? 'ASC' : 'DESC'}`;
      }
      if (limit) {
        sql += ` LIMIT $${params.length + 1}`;
        params.push(parseInt(limit as string));
      }
      
      const data = await db.unsafe(sql, params);
      res.json(data);
    } catch (error: any) {
      console.error(`Query failed: ${sql}`, error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Insert
  app.post("/api/insert/:table", async (req, res) => {
    const { table } = req.params;
    const data = req.body;
    try {
      for (const item of data) {
        const keys = Object.keys(item);
        const values = Object.values(item);
        await db`
          INSERT INTO ${db(table)} (${db(keys.join(', '))})
          VALUES (${values.join(', ')})
        `;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Upsert
  app.post("/api/upsert/:table", async (req, res) => {
    const { table } = req.params;
    const { data, options } = req.body;
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      await db`
        INSERT INTO ${db(table)} (${db(keys.join(', '))})
        VALUES (${values.join(', ')})
        ON CONFLICT (${db(options.on)}) 
        DO UPDATE SET ${db(keys.map(k => `${k} = EXCLUDED.${k}`).join(', '))}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Delete
  app.post("/api/delete/:table", async (req, res) => {
    const { table } = req.params;
    const { eq } = req.body;
    try {
      await db`DELETE FROM ${db(table)} WHERE ${db(eq[0])} = ${eq[1]}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Save API Key
  app.post("/api/api-keys", async (req, res) => {
    const { userId, serviceName, apiKey } = req.body;
    try {
      await db`
        INSERT INTO user_api_keys (user_id, service_name, api_key_encrypted)
        VALUES (${userId}, ${serviceName}, ${apiKey})
        ON CONFLICT (user_id, service_name) 
        DO UPDATE SET api_key_encrypted = ${apiKey}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Get All API Keys
  app.get("/api/api-keys", async (req, res) => {
    const userId = req.query.userId as string;
    try {
      const data = await db`
        SELECT service_name, api_key_encrypted 
        FROM user_api_keys 
        WHERE user_id = ${userId}
      `;
      const keys = data.reduce((acc: any, item: any) => {
        acc[item.service_name] = item.api_key_encrypted;
        return acc;
      }, {});
      res.json(keys);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
      await db`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          persona TEXT,
          timestamp BIGINT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS memories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          content TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          tags TEXT[] DEFAULT '{}',
          importance INTEGER DEFAULT 1,
          timestamp BIGINT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS custom_personas (
          id TEXT PRIMARY KEY,
          user_id UUID,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          avatar TEXT,
          color TEXT,
          system_instruction TEXT NOT NULL,
          capabilities TEXT[],
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS user_api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          service_name TEXT NOT NULL,
          api_key_encrypted TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, service_name)
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          title TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS agents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          model TEXT NOT NULL,
          memories TEXT,
          skills TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS user_agents (
          user_id UUID,
          agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, agent_id)
        );
        INSERT INTO settings (key, value) VALUES ('admin_pin', '"135790"') ON CONFLICT DO NOTHING;
      `;
      console.log("All tables ensured.");
    } catch (error) {
      console.error("Error ensuring tables:", error);
    }
  });
}

startServer();
