import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

function setCors(res: NextApiResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Accept, api_key"
    );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    setCors(res);
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const serverApiKey = process.env.SERVER_API_KEY;
    const apiKeyHeader = (req.headers["api_key"] || req.headers["x-api-key"]) as string | undefined;
    if (!serverApiKey || !apiKeyHeader || apiKeyHeader !== serverApiKey) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: "Server not configured for database access" });
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    try {
        const { data, error } = await supabaseAdmin
            .from("names")
            .select("name")
            .eq("approved", true)
            .order("name", { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ data });
    } catch (e: any) {
        return res.status(500).json({ error: e?.message || "Unknown error" });
    }
}


