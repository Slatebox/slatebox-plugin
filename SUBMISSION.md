# Submitting the Slatebox plugin

Nothing here has been submitted. Both submissions are owner steps. Field values below are exact; copy them as written.

Formats checked 2026-11-23 against claude.com/docs/plugins/submit, code.claude.com/docs/en/plugins-reference, developers.openai.com/apps-sdk/deploy/submission, developers.openai.com/plugins/build/plugins and developers.openai.com/plugins/deploy/submission-errors.

---

## 1. Anthropic: Claude plugin directory

Portal: https://claude.ai/directory/manage → **Submit new** → **Plugin bundle**.

Before you start:
- [ ] The repo is public: https://github.com/Slatebox/slatebox-plugin (done).
- [ ] Your claude.ai account is connected to GitHub with push access to `Slatebox/slatebox-plugin`.
- [ ] `claude plugin validate . --strict --profile directory` passes (it does at 0.1.0; the portal runs more checks).
- [ ] The "slatebox" MCP connector submission exists (done; in review).

### Source
| Field | Value |
|---|---|
| Repository | `Slatebox/slatebox-plugin` |
| Plugin path | *(leave empty: the plugin is at the repo root)* |
| Branch or tag | *(leave empty: follows `main`)*, or `v0.1.0` to pin the first release |

Then press **Validate**.

### Listing details (read-only; comes from `.claude-plugin/plugin.json` and `README.md`)
| Field | Value in the repo |
|---|---|
| name | `slatebox` |
| displayName | Slatebox |
| version | 0.1.0 |
| description | Mind maps, flowcharts, project plans, smart boards and presentations, drawn as real notes and lines on a shared Slatebox canvas that your team can open and edit together. |
| author | Slatebox LLC, https://slatebox.com |
| icon | `./assets/slatebox-icon-512.png` (512×512 PNG) |
| documentationUrl | https://docs.slatebox.com/developers/slateboxapi/mcp/ |
| supportUrl | https://slatebox.com/contact/ |
| privacyPolicyUrl | https://slatebox.com/privacy/ |
| termsOfServiceUrl | https://slatebox.com/terms/ |
| license | MIT |
| Components | 7 skills, 3 commands, 1 MCP server (`slatebox`, http, https://app.slatebox.com/mcp) |

To change any of these, edit the repo, raise `version`, push and press **Validate** again.

**Linking to the connector**: the plugin's `.mcp.json` names the same URL as the "slatebox" connector (`https://app.slatebox.com/mcp`). The public submit page shows no explicit "link to connector" field. If the portal offers one, choose the existing **slatebox** connector. If it does not, the shared URL is the link, and the docs only ask that the server also be submitted as a connector, which it is.

### Data handling
| Question | Answer |
|---|---|
| Does the plugin read or store personal data? | The plugin itself stores nothing. Its MCP server (Slatebox, first-party) reads and writes the signed-in person's slates, with their name on edits and comments, as described in https://slatebox.com/privacy/. |
| Does it send data to services other than declared connectors? | No. The only network destination is `https://app.slatebox.com/mcp`, the declared MCP server. Skills and commands are instructions only; there are no hooks, scripts or binaries. |
| How long does it keep data? | The plugin keeps nothing. Slates stay in the person's Slatebox account until they delete them; retention is in the privacy policy. |
| Is it intended for people under 18? | No. |

### Compliance
- Contact email: the owner's Slatebox address (enter it in the portal; it is kept out of this repo). Public support: https://slatebox.com/contact/
- Tick all four acknowledgements after reading them (the Anthropic Software Directory Terms and Policy).

### Review and submit
| Setting | Value |
|---|---|
| New versions arrive by | GitHub push webhook (default) |
| Auto-publish passing versions | Off for the first release (a reviewer publishes 0.1.0); turn on after |

Then **Submit for review**. Limits: 10 submissions per organization per 24 hours; the repository and folder cannot be changed after submitting.

---

## 2. OpenAI: ChatGPT and Codex plugin directory

Portal: https://platform.openai.com → **Plugins** → **Upload new or existing plugin**. The upload is the ZIP built by `npm run build:openai:final` (`dist/slatebox-<version>-openai.zip`).

### What the owner must do first (blocking)

1. **Verify the OpenAI Platform organization** (individual or business identity, Slatebox LLC). Only an org owner, or a member with Apps Management Write, can submit. The verified name becomes `developerName`.
2. **Record the demo video** and host it where a reviewer can open it without signing in (an unlisted YouTube or Loom link). Show the five positive test cases below running in ChatGPT against the demo account: the prompt, the tool call and the slate opening from its link. Put the URL in `openai/listing.json` → `review.demo_recording_url`.
3. **Create the demo account**: a dedicated Slatebox account (not a real person's), password sign-in, no 2FA, no magic link or email code. Seed three slates: a mind map, a flowchart and a pipeline board. Make the flowchart slate the one for test case 5 and replace `DEMO_SHARE_ID` in `openai/listing.json` with its id. Enter the account's email and password only in the portal's **Review details** form, never in the repo or ZIP.
4. **Domain challenge**: once the draft exists the portal gives a token. Serve it as `text/plain`, the exact token and nothing else, at `https://app.slatebox.com/.well-known/openai-apps-challenge` (or on `slatebox.com` as the parent domain). Today that path returns the app's HTML, so this needs a small app change or a static file on slatebox.com, shipped through the normal ship path.
5. **Tool annotation justifications**: every tool already sends explicit `readOnlyHint`, `destructiveHint` and `openWorldHint` booleans. The portal may ask for a one-line justification per annotation (the submission-errors page says required; the guidelines say no longer required). Have one line ready for each destructive tool, naming what is irreversible and the confirmation step (`confirmation_required`) that guards it.
6. **The `exec` question**: guideline 6.2(b) forbids a generic executor that reaches operations not exposed as their own tools. Every client method is also its own typed tool, so `exec` reaches nothing extra; a reviewer may still question it. Fallback if held: serve the typed tools without `exec` and `describe` to the ChatGPT client.
7. Run `npm run build:openai:final`. It fails until steps 2 and 3 are done.

### Package (in the ZIP; from `openai/listing.json` and `.claude-plugin/plugin.json`)
| Field | Value |
|---|---|
| name | `slatebox` |
| version | 0.1.0 |
| displayName (≤30) | Slatebox |
| shortDescription (≤30) | Mind maps and diagrams |
| longDescription (≤4000) | Create mind maps, flowcharts, project plans and smart boards as editable slates. Slatebox draws them as real notes and lines on a shared canvas and returns a link that your team can open and edit together. With Slatebox you can: draw a mind map, a flowchart or a Gantt-chart project plan from a description or from Mermaid; read a slate, summarise it, and get it back as Mermaid; add boards such as a pipeline, hiring plan or launch plan, with rules that hold when cards move; restyle a slate's presentation, which plays on the live canvas; ask the Slatebox agent to work on a slate in the open, with removals held for a person. Every call acts as you and reaches only the slates you can open. Changes that remove or overwrite work ask for your confirmation first. |
| developerName | Slatebox LLC (set from the verified identity) |
| category | Productivity |
| capabilities | `[]` |
| websiteURL | https://slatebox.com |
| supportURL | https://slatebox.com/contact/ |
| privacyPolicyURL | https://slatebox.com/privacy/ |
| termsOfServiceURL | https://slatebox.com/terms/ |
| defaultPrompt | "Make a mind map of our Q1 launch ideas" · "Turn these steps into a flowchart" · "Draft a six-week hiring plan as a Gantt chart" |
| brandColor / brandColorDark | `#1d2026` / `#fbcc88` (contrast checked by the build) |
| logo / composerIcon | `./assets/slatebox-icon-512.png` |
| onboardingSkill | `./skills/make-mind-map/SKILL.md` |
| Skills | the same 7 skills as the Claude plugin |
| countries | not set (all) |
| release_notes | First release: mind maps, flowcharts, project plans, smart boards, slate summaries, presentations and the Slatebox agent. |
| commerce | false |

Copy rules the build enforces: no pricing, "free", trials or promotions; no comparisons with other products; no "MCP" or "Plugin" in the name.

### MCP server (`mcp.json` in the ZIP, and the portal's "With MCP" step)
| Field | Value |
|---|---|
| Server | one: `slatebox`, `streamable-http`, `https://app.slatebox.com/mcp` |
| Auth | OAuth, client mode `dcr` (dynamic client registration), registrationUrl `https://app.slatebox.com/oauth/register` |
| Client secret / headers | none |
| Callback | DCR accepts any https redirect, so the ChatGPT callback the portal shows works without changes |

### Review details (portal form)
Demo account credentials (step 3), demo video URL (step 2).

Positive test cases (5; also in the ZIP):
| # | Description | Prompt | Tools | Expected |
|---|---|---|---|---|
| 1 | Mind map from a topic | Make a mind map of ideas for our team offsite. | import_mermaid | New slate with a root and several branches; replies with the link. |
| 2 | Flowchart from a chain of steps | Flowchart this: request, manager review, finance approval, paid. | create_slate | New slate with four connected notes in order; replies with the link. |
| 3 | Project plan as a Gantt chart | Draft a six-week hiring plan for two engineers as a Gantt chart. | import_mermaid | New slate with a Gantt plan of about six weeks; replies with the dates and the link. |
| 4 | Mermaid made editable | Make this something my team can edit: graph TD; A-->B; B-->C | import_mermaid | New slate with notes A, B, C joined by two lines; replies with the link. |
| 5 | Read a slate back | Summarise the slate at https://app.slatebox.com/canvas/&lt;demo id&gt; and give it to me as Mermaid. | export_mermaid, get_slate | A short summary and the Mermaid text; no changes. |

Negative test cases (3):
| # | Description | Prompt |
|---|---|---|
| 1 | An explanation, nothing to draw | What is a mind map? |
| 2 | Unrelated writing task | Write a cover letter for a product manager job. |
| 3 | Unrelated calculation | Convert 20 US dollars to euros. |

Then **Submit for review** and accept the attestations. After approval, the owner chooses when to publish. Later metadata or skill changes need a new ZIP; MCP tool changes are rescanned daily.

---

## Format uncertainties (re-check in each portal)

- OpenAI `mcp.json`: the published agent-plugins.org 1.0.0 schema does not allow `extensions` on a server entry, but OpenAI's docs put OAuth at `mcpServers.<name>.extensions["com.openai"].auth`. The ZIP follows OpenAI's docs; the build validates everything else against the schema.
- OpenAI `review.test_cases.*.tools_triggered`: the docs name the field but give no type; the ZIP sends an array of tool names.
- OpenAI root `description` limit: 4000 in one page, 1,024 in another; ours is under 200 characters.
- Claude: the plugin directory form has no documented "link to connector" field (see above).
- Claude `icon`: no documented size rule; the 512×512 PNG matches the connector icon.
