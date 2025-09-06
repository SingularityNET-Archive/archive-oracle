import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Simple runtime validation without extra deps
type TimestampedVideo = {
    url?: string;
    intro?: string;
    timestamps?: string;
};

type WorkingDoc = {
    title?: string;
    link?: string;
};

type MeetingInfo = {
    name: string;
    date: string; // YYYY-MM-DD
    host?: string;
    documenter?: string;
    translator?: string;
    peoplePresent?: string;
    purpose?: string;
    townHallNumber?: string;
    googleSlides?: string;
    meetingVideoLink?: string;
    miroBoardLink?: string;
    otherMediaLink?: string;
    transcriptLink?: string;
    mediaLink?: string;
    workingDocs?: WorkingDoc[];
    timestampedVideo?: TimestampedVideo;
};

type AgendaItem = Record<string, any>;

type IncomingSummary = {
    workgroup: string;
    workgroup_id: string;
    user_id: string;
    meetingInfo: MeetingInfo;
    agendaItems?: AgendaItem[];
    tags?: Record<string, any>;
    type?: string; // optional, will default to "custom"
    noSummaryGiven?: boolean; // optional, default false
    canceledSummary?: boolean; // optional, default false
};

function setCors(res: NextApiResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Accept, api_key"
    );
}

function isIsoDateOnly(value: string): boolean {
    // allow YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validatePayload(body: any): { ok: true; data: IncomingSummary } | { ok: false; error: string } {
    if (typeof body !== "object" || body == null) {
        return { ok: false, error: "Invalid JSON body" };
    }

    const { workgroup, workgroup_id, meetingInfo, user_id } = body;

    if (!workgroup || typeof workgroup !== "string") {
        return { ok: false, error: "'workgroup' is required and must be a string" };
    }
    if (!workgroup_id || typeof workgroup_id !== "string") {
        return { ok: false, error: "'workgroup_id' is required and must be a string (uuid)" };
    }
    if (!user_id || typeof user_id !== "string") {
        return { ok: false, error: "'user_id' is required and must be a string (uuid)" };
    }
    // Basic UUID check (lenient)
    if (!/^[0-9a-fA-F-]{36}$/.test(user_id)) {
        return { ok: false, error: "'user_id' must be a valid UUID" };
    }
    if (!meetingInfo || typeof meetingInfo !== "object") {
        return { ok: false, error: "'meetingInfo' object is required" };
    }
    if (!meetingInfo.name || typeof meetingInfo.name !== "string") {
        return { ok: false, error: "'meetingInfo.name' is required and must be a string" };
    }
    if (!meetingInfo.date || typeof meetingInfo.date !== "string" || !isIsoDateOnly(meetingInfo.date)) {
        return { ok: false, error: "'meetingInfo.date' must be in 'YYYY-MM-DD' format" };
    }

    // Optional arrays validation
    if (meetingInfo.workingDocs && !Array.isArray(meetingInfo.workingDocs)) {
        return { ok: false, error: "'meetingInfo.workingDocs' must be an array" };
    }
    if (body.agendaItems && !Array.isArray(body.agendaItems)) {
        return { ok: false, error: "'agendaItems' must be an array" };
    }

    return { ok: true, data: body as IncomingSummary };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    setCors(res);
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // API key check
    const serverApiKey = process.env.SERVER_API_KEY;
    const apiKeyHeader = (req.headers["api_key"] || req.headers["x-api-key"]) as string | undefined;
    if (!serverApiKey || !apiKeyHeader || apiKeyHeader !== serverApiKey) {
        return res.status(403).json({ error: "Forbidden" });
    }

    // Service role client (for RLS-protected writes)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: "Server not configured for database access" });
    }
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });

    // Validate body
    const validation = validatePayload(req.body);
    if (!validation.ok) {
        return res.status(400).json({ error: validation.error });
    }
    const payload = validation.data;

    // Defaults for optional bottom 3 fields
    const typeValue = payload.type ?? "custom";
    const noSummaryGiven = payload.noSummaryGiven ?? false;
    const canceledSummary = payload.canceledSummary ?? false;

    // Build DB row values (mirrors utils/saveCustomAgenda)
    const dateIso = new Date(payload.meetingInfo.date + "T00:00:00Z").toISOString();
    const updates = {
        name: payload.meetingInfo.name,
        template: typeValue,
        date: dateIso,
        workgroup_id: payload.workgroup_id,
        user_id: payload.user_id,
        summary: {
            workgroup: payload.workgroup,
            workgroup_id: payload.workgroup_id,
            meetingInfo: payload.meetingInfo,
            agendaItems: payload.agendaItems ?? [],
            tags: payload.tags ?? {},
            type: typeValue,
            noSummaryGiven,
            canceledSummary,
        },
        updated_at: new Date().toISOString(),
    };

    try {
        const { data, error } = await supabaseAdmin
            .from("meetingsummaries")
            .upsert(updates, { onConflict: "name,date,workgroup_id,user_id" })
            .select("date, meeting_id, updated_at");

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data });
    } catch (e: any) {
        return res.status(500).json({ error: e?.message || "Unknown error" });
    }
}


