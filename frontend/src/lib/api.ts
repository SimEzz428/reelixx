const RAW_API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
export const BACKEND_URL = (/^https?:\/\//.test(RAW_API) ? RAW_API : `https://${RAW_API}`).replace(/\/$/, "");

export async function createProject(payload: any) {
  const r = await fetch(`${BACKEND_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function generateForProject(projectId: number, payload: any) {
  const r = await fetch(`${BACKEND_URL}/projects/${projectId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getLatestVariant(projectId: number) {
  const r = await fetch(`${BACKEND_URL}/projects/${projectId}/variants/latest`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function generateStatic(projectId: number, payload: any) {
  const r = await fetch(`${BACKEND_URL}/generate_static/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, ...payload }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPostText(projectId: number) {
  const r = await fetch(`${BACKEND_URL}/post_text/projects/${projectId}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function assembleVariant(variantId: number) {
  const r = await fetch(`${BACKEND_URL}/variants/${variantId}/assemble`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function toAbsolute(u?: string | null) {
  if (!u) return "";
  if (/^https?:\/\//.test(u)) return u;
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${BACKEND_URL}${path}`;
}

export async function pingHealth(): Promise<"up" | "down"> {
  try {
    const r = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
    return r.ok ? "up" : "down";
  } catch {
    return "down";
  }
}

