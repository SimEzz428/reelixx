const RAW_API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
export const BACKEND_URL = (/^https?:\/\//.test(RAW_API) ? RAW_API : `https://${RAW_API}`).replace(/\/$/, "");

export type AdFormat = "reel" | "story" | "square" | "portrait";
export type RenderMode = "auto" | "ai" | "free";
export type MusicMood = "upbeat" | "chill" | "luxury" | "none";

export type Brief = {
  title?: string;
  description?: string;
  price?: string;
  brand?: string;
  images?: string[];
  bullets?: string[];
};

export type Project = {
  id: number;
  title?: string | null;
  product_url?: string | null;
  brief_json?: Brief | null;
  brand_json?: { name?: string; color?: string } | null;
};

export type Scene = {
  id: string;
  start: number;
  end: number;
  text: string;
  sfx?: string;
  transition_in?: string;
};

export type Storyboard = {
  format?: AdFormat;
  canvas: { w: number; h: number; fps: number };
  scenes: Scene[];
};

export type Variant = {
  id: number;
  project_id: number;
  status?: string | null;
  tone?: string | null;
  mp4_url?: string | null;
  script_json?: { meta?: { source?: string } } | null;
  storyboard_json?: Storyboard | null;
};

export type PostText = { caption: string; hashtags: string[]; text: string };
export type Health = { ok: boolean; db: boolean; ai: boolean };
export type AssembleResult = { mode: "ai" | "free"; mp4_url: string; download: string; filename: string; duration: number };

/** Turn a FastAPI error body into a readable message. */
async function errorMessage(r: Response): Promise<string> {
  const raw = await r.text().catch(() => "");
  try {
    const detail = JSON.parse(raw)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: { loc?: string[]; msg?: string }) => `${d.loc?.slice(1).join(".")}: ${d.msg}`).join("; ");
    }
  } catch {
    /* not JSON */
  }
  return raw || `${r.status} ${r.statusText}`;
}

async function request<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let r: Response;
  try {
    r = await fetch(`${BACKEND_URL}${path}`, {
      ...rest,
      headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new Error(`Can't reach the API at ${BACKEND_URL}. Is the backend running?`);
  }
  if (!r.ok) throw new Error(await errorMessage(r));
  return r.json() as Promise<T>;
}

export const api = {
  health: () => request<Health>("/health", { cache: "no-store" }),

  scrape: (url: string) =>
    request<{ ok: boolean; brief?: Brief; reason?: string }>("/scrape/", { method: "POST", json: { url } }),

  createProject: (payload: { title: string; product_url?: string; brief: Brief; brand: { name: string; color: string } }) =>
    request<Project>("/projects/", { method: "POST", json: payload }),

  getProject: (id: number) => request<Project>(`/projects/${id}`),

  generate: (projectId: number, payload: { tones?: string[]; persona?: string; format: AdFormat; ai_script?: boolean }) =>
    request<{ id: number; status: string }>(`/projects/${projectId}/generate`, { method: "POST", json: payload }),

  latestVariant: (projectId: number) => request<Variant>(`/projects/${projectId}/variants/latest`),

  postText: (projectId: number) => request<PostText>(`/post_text/projects/${projectId}`),

  staticEndcard: (projectId: number, payload: { width: number; height: number; cta?: string }) =>
    request<{ ok: boolean; data_url?: string; reason?: string }>("/generate_static/", {
      method: "POST",
      json: { project_id: projectId, ...payload },
    }),

  assemble: (variantId: number, payload: { mode: RenderMode; music_mood?: MusicMood; voice?: string }) =>
    request<AssembleResult>(`/variants/${variantId}/assemble`, { method: "POST", json: payload }),

  exportZip: (variantId: number) =>
    request<{ download: string }>(`/variants/${variantId}/export_zip`, { method: "POST" }),
};

/** Resolve a backend-relative URL (e.g. "/exports/x.mp4") to an absolute one. */
export function toAbsolute(u?: string | null) {
  if (!u) return "";
  if (/^(https?:|data:)/.test(u)) return u;
  return `${BACKEND_URL}${u.startsWith("/") ? u : `/${u}`}`;
}

/** URL that forces a download (Content-Disposition: attachment) for a local export. */
export function downloadUrl(u?: string | null) {
  if (!u) return "";
  if (/^https?:/.test(u) && !u.startsWith(BACKEND_URL)) return u; // e.g. S3
  const name = u.split("?")[0].split("/").pop();
  return name ? toAbsolute(`/exports/download/${name}`) : "";
}

export function errorText(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

export const FORMATS: Record<AdFormat, { label: string; tag: string; w: number; h: number }> = {
  reel: { label: "Reel", tag: "9:16", w: 1080, h: 1920 },
  story: { label: "Story", tag: "9:16", w: 1080, h: 1920 },
  square: { label: "Feed Post", tag: "1:1", w: 1080, h: 1080 },
  portrait: { label: "Portrait", tag: "4:5", w: 1080, h: 1350 },
};
