#!/usr/bin/env node
// Builds the OpenAI (ChatGPT + Codex) plugin ZIP from the same sources as the Claude plugin.
//
//   node scripts/build-openai.mjs            build dist/slatebox-<version>-openai.zip (warnings allowed)
//   node scripts/build-openai.mjs --final    also fail on anything that blocks a directory submission
//                                            (missing demo video, placeholder demo slate id)
//
// Layout produced (OpenAI "portable" Agent Plugins format):
//   plugin.json   root manifest, $schema agent-plugins.org 1.0.0, OpenAI fields in extensions["com.openai"]
//   mcp.json      the hosted server as streamable-http, OAuth (DCR) in extensions["com.openai"].auth
//   skills/       copied unchanged from ./skills
//   assets/       copied unchanged from ./assets
// Claude-only parts (commands/, .claude-plugin/, .mcp.json) are left out.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const final = process.argv.includes("--final");
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => (final ? errors : warnings).push(m);

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const claude = readJson(".claude-plugin/plugin.json");
const claudeMcp = readJson(".mcp.json");
const listing = readJson("openai/listing.json");

// ---- plugin.json --------------------------------------------------------------------------
const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

const plugin = {
  $schema: PLUGIN_SCHEMA,
  name: claude.name,
  version: claude.version,
  description: claude.description,
  author: claude.author,
  homepage: claude.homepage,
  repository: claude.repository,
  license: claude.license,
  keywords: claude.keywords.filter((k) => k !== "mcp"),
  extensions: {
    "com.openai": {
      interface: listing.interface,
      review: listing.review,
      publication: listing.publication,
    },
  },
};

// ---- mcp.json -----------------------------------------------------------------------------
const servers = Object.entries(claudeMcp.mcpServers);
if (servers.length !== 1) fail(`OpenAI allows exactly one MCP server per plugin; .mcp.json has ${servers.length}`);
const [serverName, server] = servers[0];
if (server.type !== "http" || !server.url) fail(".mcp.json server must be a remote http server with a url");
const mcp = {
  $schema: MCP_SCHEMA,
  mcpServers: {
    [serverName]: {
      type: "streamable-http",
      url: server.url,
      extensions: { "com.openai": { auth: listing.mcpAuth } },
    },
  },
};

// ---- checks from developers.openai.com/plugins (deploy/submission, deploy/submission-errors) ----
const I = listing.interface;
const len = (v) => [...(v ?? "")].length;
const oneLine = (v) => !/[\r\n]/.test(v ?? "");
const https = (v) => typeof v === "string" && /^https:\/\/[^\s@]+$/.test(v) && v.length <= 1024;

if (!/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(plugin.name) || plugin.name.length > 64) fail("name: lowercase letters, digits, . and - only, <=64");
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(plugin.version ?? "")) fail("version must be semver");
if (len(plugin.description) > 1024) fail(`description is ${len(plugin.description)} chars (keep <=1024)`);
if (len(plugin.author?.name) === 0 || len(plugin.author?.name) > 120) fail("author.name required, <=120");
if (!I.displayName || len(I.displayName) > 30 || !oneLine(I.displayName)) fail("displayName required, one line, <=30");
if (!I.shortDescription || len(I.shortDescription) > 30 || !oneLine(I.shortDescription)) fail("shortDescription required, one line, <=30");
if (!I.longDescription || len(I.longDescription) > 4000) fail("longDescription required, <=4000");
if (!I.developerName || len(I.developerName) > 80) fail("developerName required, <=80");
const CATEGORIES = ["Productivity", "Creativity", "Developer Tools", "Business & Operations", "Data & Analytics", "Communication", "Education & Research", "Security", "Finance", "Healthcare", "Travel", "Entertainment", "Other"];
if (!CATEGORIES.includes(I.category)) fail(`category must be one of: ${CATEGORIES.join(", ")}`);
if (!Array.isArray(I.capabilities) || I.capabilities.length > 20) fail("capabilities must be an array (<=20)");
for (const k of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) if (!https(I[k])) fail(`${k} must be an https URL <=1024 (required for a remote MCP server)`);
const prompts = [].concat(I.defaultPrompt ?? []);
if (prompts.length > 3 || new Set(prompts).size !== prompts.length || prompts.some((p) => len(p) > 128 || /@\w/.test(p))) fail("defaultPrompt: <=3 unique entries, each <=128 chars, no @mentions");
for (const k of ["brandColor", "brandColorDark"]) if (I[k] && !/^#[0-9a-fA-F]{6}$/.test(I[k])) fail(`${k} must be #RRGGBB`);
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
if (I.brandColor && contrast(I.brandColor, "#ffffff") < 2) fail("brandColor needs >=2:1 contrast against white");
if (I.brandColorDark && contrast(I.brandColorDark, "#212121") < 2) fail("brandColorDark needs >=2:1 contrast against #212121");
for (const k of ["logo", "logoDark", "composerIcon", "composerIconDark", "onboardingSkill"]) {
  if (!I[k]) { if (k === "logo" || k === "composerIcon") fail(`${k} is required`); continue; }
  if (!I[k].startsWith("./")) fail(`${k} must start with ./`);
  else if (!fs.existsSync(path.join(root, I[k]))) fail(`${k} points at a missing file: ${I[k]}`);
}
for (const k of ["logo", "composerIcon"]) {
  if (!I[k] || !fs.existsSync(path.join(root, I[k]))) continue;
  const buf = fs.readFileSync(path.join(root, I[k]));
  if (buf.length > 5 * 1024 * 1024) fail(`${k} is over 5 MiB`);
  if (buf.subarray(1, 4).toString() === "PNG") {
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    if (w !== h || w < 48 || w > 4096) fail(`${k} must be square, 48 to 4096 px (is ${w}x${h})`);
  }
}

const R = listing.review ?? {};
const pos = R.test_cases?.positive ?? [];
const neg = R.test_cases?.negative ?? [];
if (pos.length !== 5) fail(`review needs 5 positive test cases (has ${pos.length})`);
if (neg.length !== 3) fail(`review needs 3 negative test cases (has ${neg.length})`);
for (const [i, t] of pos.entries()) for (const k of ["description", "prompt", "tools_triggered", "expected_behavior"]) if (!t[k] || (Array.isArray(t[k]) && !t[k].length)) fail(`positive test ${i + 1} is missing ${k}`);
for (const [i, t] of neg.entries()) for (const k of ["description", "prompt"]) if (!t[k]) fail(`negative test ${i + 1} is missing ${k}`);
if ("test_credentials" in R || "reviewer_instructions" in R) fail("review must not hold test_credentials or reviewer_instructions (enter them in the portal)");
if (!R.demo_recording_url) warn("review.demo_recording_url is not set (required for MCP review): record the demo video and add its URL");
if (JSON.stringify(R).includes("DEMO_SHARE_ID")) warn("a test case still says DEMO_SHARE_ID: replace it with the demo account's slate id");
if (!listing.publication?.release_notes) fail("publication.release_notes is required for MCP plugins");

// Listing copy rules (plugin guidelines): no pricing or promotion, no comparisons, no "MCP"/"Plugin" in the name.
const copy = [I.displayName, I.shortDescription, I.longDescription, plugin.description, ...prompts, listing.publication?.release_notes].join("\n");
const banned = /\b(free|price|pricing|paid|subscription|subscribe|trial|discount|promo|cheap|\$\d|pro plan|miro|mural|lucid|figjam|canva|better than|alternative to|instead of)\b/i;
const hit = copy.match(banned);
if (hit) fail(`listing copy contains "${hit[0]}" (no pricing, promotions or comparisons in OpenAI listing copy)`);
if (/\b(mcp|plugin)\b/i.test(I.displayName)) fail('displayName must not include "MCP" or "Plugin"');

// Skills: front matter is a mapping with name + description only (portable subset), description <=1024.
const skillsDir = path.join(root, "skills");
const skillNames = new Set();
for (const dir of fs.readdirSync(skillsDir)) {
  if (dir.startsWith(".")) { fail(`skill folder ${dir} must not start with "."`); continue; }
  const file = path.join(skillsDir, dir, "SKILL.md");
  if (!fs.existsSync(file)) { fail(`skills/${dir} has no SKILL.md`); continue; }
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { fail(`skills/${dir}/SKILL.md must start with --- front matter`); continue; }
  const fm = Object.fromEntries(m[1].split("\n").filter(Boolean).map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  const extra = Object.keys(fm).filter((k) => !["name", "description"].includes(k));
  if (extra.length) fail(`skills/${dir}: front matter keys ${extra.join(", ")} are not portable; keep name and description only`);
  if (!fm.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name)) fail(`skills/${dir}: name must be lowercase words joined by hyphens`);
  if (fm.name !== dir) fail(`skills/${dir}: name "${fm.name}" should match its folder`);
  if (skillNames.has(fm.name)) fail(`duplicate skill name ${fm.name}`);
  skillNames.add(fm.name);
  if (`${plugin.name}:${fm.name}`.length > 64) fail(`skills/${dir}: "${plugin.name}:${fm.name}" is over 64 characters`);
  if (!fm.description || len(fm.description) > 1024) fail(`skills/${dir}: description required, <=1024`);
  if (!m[2].trim()) fail(`skills/${dir}: body is empty`);
  if (/\b[A-Z]{2,}(?: [A-Z]{2,}){2,}\b/.test(m[2])) warn(`skills/${dir}: looks like an all-caps placeholder in the body`);
}

// ---- JSON Schema validation against agent-plugins.org 1.0.0 -------------------------------
async function loadSchema(url) {
  const cache = path.join(root, "dist", ".schemas", path.basename(url));
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    fs.writeFileSync(cache, text);
    return JSON.parse(text);
  } catch (e) {
    if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, "utf8"));
    warn(`could not fetch ${url} (${e.message}); schema validation skipped`);
    return null;
  }
}
const ajv = new Ajv2020({ allErrors: true, strict: false });
const pluginSchema = await loadSchema(PLUGIN_SCHEMA);
if (pluginSchema && !ajv.validate(pluginSchema, plugin)) fail(`plugin.json fails ${PLUGIN_SCHEMA}: ${ajv.errorsText()}`);
const mcpSchema = await loadSchema(MCP_SCHEMA);
if (mcpSchema) {
  // The published 1.0.0 mcp schema has additionalProperties:false on server entries and no
  // `extensions` key, while OpenAI's docs place OAuth at mcpServers.<name>.extensions["com.openai"].auth.
  // Validate everything else, and keep OpenAI's documented location for auth.
  const stripped = structuredClone(mcp);
  for (const s of Object.values(stripped.mcpServers)) delete s.extensions;
  if (!ajv.validate(mcpSchema, stripped)) fail(`mcp.json fails ${MCP_SCHEMA}: ${ajv.errorsText()}`);
}
const authMode = listing.mcpAuth?.client?.mode;
if (listing.mcpAuth?.type !== "oauth" || !["dcr", "cimd", "provided"].includes(authMode)) fail("mcpAuth must be OAuth with client.mode dcr, cimd or provided");
if (authMode !== "provided" && listing.mcpAuth.client.clientId) fail("a dcr/cimd client must not carry clientId");
if (/secret/i.test(JSON.stringify(listing.mcpAuth))) fail("mcpAuth must not carry a secret");

// ---- report, then write ------------------------------------------------------------------
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}

const dist = path.join(root, "dist");
const stage = path.join(dist, "openai");
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.writeFileSync(path.join(stage, "plugin.json"), JSON.stringify(plugin, null, 2) + "\n");
fs.writeFileSync(path.join(stage, "mcp.json"), JSON.stringify(mcp, null, 2) + "\n");
fs.cpSync(path.join(root, "skills"), path.join(stage, "skills"), { recursive: true });
fs.cpSync(path.join(root, "assets"), path.join(stage, "assets"), { recursive: true });

const zipName = `${plugin.name}-${plugin.version}-openai.zip`;
const zipPath = path.join(dist, zipName);
fs.rmSync(zipPath, { force: true });
// Files at the archive root, "/" separators, no directory entries, no extra file attributes.
execFileSync("zip", ["-r", "-X", "-D", "-q", zipPath, "."], { cwd: stage });
const listingOut = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" }).trim().split("\n");
const bad = listingOut.filter((p) => p.includes("..") || p.startsWith("/") || p.split("/").length > 20);
if (bad.length) { console.error(`error: unsafe ZIP paths: ${bad.join(", ")}`); process.exit(1); }
const size = fs.statSync(zipPath).size;
if (size > 100 * 1024 * 1024 || listingOut.length > 5000) { console.error("error: ZIP over 100 MB or 5,000 entries"); process.exit(1); }
console.log(`built dist/${zipName} (${listingOut.length} files, ${(size / 1024).toFixed(1)} KiB)`);
for (const p of listingOut) console.log(`  ${p}`);
