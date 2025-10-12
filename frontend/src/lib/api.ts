// frontend/src/lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:8000";

type Brief = {
  title?: string;
  description?: string;
  price?: string;
  brand?: string | Record<string, unknown>;
  images?: string[];
};

export type ProjectCreate = {
  title?: string;
  product_url?: string;
  brief?: Brief;
  brand?: Record<string, unknown>;
};

export type GenerateRequest = {
  n_variants?: number;
  tones?: string[];
  persona?: string;
  voice_id?: string;
};

export async function createProject(body: ProjectCreate) {
  const res = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createProject failed: ${res.status}`);
  return (await res.json()) as { id: number };
}

export async function generateForProject(
  projectId: number,
  body: GenerateRequest,
) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`generateForProject failed: ${res.status}`);
  return await res.json();
}

export async function getLatestVariant(projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/variants/latest`);
  if (!res.ok) throw new Error(`getLatestVariant failed: ${res.status}`);
  return await res.json(); // { id, status, tone, persona, script_json, storyboard_json }
}

export async function generateStatic(
  projectId: number,
  opts?: { cta?: string; width?: number; height?: number },
) {
  const body = {
    project_id: projectId,
    cta: opts?.cta ?? "Try it today →",
    width: opts?.width ?? 1080,
    height: opts?.height ?? 1920,
  };
  const res = await fetch(`${API_BASE}/generate_static/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`generateStatic failed: ${res.status}`);
  return (await res.json()) as {
    ok: boolean;
    data_url?: string;
    reason?: string;
  };
}

export async function getPostText(projectId: number) {
  const res = await fetch(`${API_BASE}/post_text/projects/${projectId}`, {
    method: "GET",
  });
  if (!res.ok) throw new Error(`getPostText failed: ${res.status}`);
  return (await res.json()) as { caption: string; hashtags: string[] };
}

export async function assembleVariant(variantId: number) {
  const res = await fetch(`${API_BASE}/variants/${variantId}/assemble`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`assembleVariant failed: ${res.status}`);
  return (await res.json()) as { ok: boolean; mp4_url?: string };
}
