# Slatebox plugin

Draw mind maps, flowcharts, project plans and smart boards on a [Slatebox](https://slatebox.com) slate from a chat, read slates back, restyle their presentations and invite the Slatebox agent to work on them. Every slate has a link your team can open and edit together, live.

One plugin serves both Claude (Claude.ai, Claude Desktop, Cowork and Claude Code) and OpenAI (ChatGPT and Codex). It connects to the hosted Slatebox MCP server at `https://app.slatebox.com/mcp`. You sign in with your Slatebox account the first time a tool runs (OAuth); the plugin holds no keys.

## What it adds

**Skills** (the assistant picks them when they fit; in Claude Code you can also type them as `/slatebox:<name>`):

| Skill | What it does | Main tools |
|---|---|---|
| `make-mind-map` | A mind map from a topic or a list of ideas | `import_mermaid` |
| `make-flowchart` | Steps, a process or Mermaid code as an editable flowchart | `create_slate`, `import_mermaid` |
| `plan-project` | A project plan as a Gantt chart with phases, dates and dependencies | `import_mermaid`, `export_mermaid` |
| `add-smart-board` | A pipeline, hiring plan, launch plan or other board with lanes, cards and rules | `list_components`, `get_slate`, `edit_slate`, `check_board_move` |
| `read-slate` | A summary, the open actions or the Mermaid text of a slate | `export_mermaid`, `get_slate`, `list_slates` |
| `present-slate` | A slate's presentation, restyled (voyage, stage, editorial, neon, sketch, blueprint, journey, calm) | `get_presentation`, `style_presentation` |
| `ask-slatebox-agent` | The Slatebox agent invited onto a slate to do a task in the open | `ask_agent`, `list_agent_tasks` |

Each skill ends by showing the slate link.

**Commands** (Claude Code and Cowork):

- `/slatebox:mindmap <topic or ideas>`
- `/slatebox:flowchart <steps, a process or Mermaid>`
- `/slatebox:plan <goal, length or deadline>`

**MCP server**: `slatebox`, remote HTTP, `https://app.slatebox.com/mcp`.

You need a Slatebox account. Sign up at [app.slatebox.com](https://app.slatebox.com).

## Install

### Claude (Claude.ai, Desktop, Cowork)

- **From the directory**: open Claude's plugin directory, search for **Slatebox** and add it. *(Not yet submitted.)*
- **The connector alone**: the Slatebox connector is submitted to the Claude Connectors Directory (in review). You can add it by hand under Settings, Connectors, Add custom connector, with the URL `https://app.slatebox.com/mcp`.

### Claude Code

From GitHub:

```text
/plugin marketplace add Slatebox/slatebox-plugin
/plugin install slatebox@slatebox
```

or, from a shell:

```bash
claude plugin marketplace add Slatebox/slatebox-plugin
claude plugin install slatebox@slatebox
```

Run `/mcp`, choose `plugin:slatebox:slatebox` and sign in with your Slatebox account. If you already added the Slatebox connector on Claude.ai, Claude Code uses that connection and skips the plugin's copy of the same server.

From a local copy (for development):

```bash
git clone https://github.com/Slatebox/slatebox-plugin
claude --plugin-dir ./slatebox-plugin
```

#### Local stdio server instead of the hosted one

If you prefer a local server that uses an API token (for scripts, or a self-hosted Slatebox), use the `slatebox-mcp` npm package. Create a token in Slatebox under Profile, Developer access, then:

```bash
claude mcp add slatebox-local \
  -e SLATEBOX_API_TOKEN=<your token> \
  -e SLATEBOX_BASE_URL=https://app.slatebox.com \
  -- npx -y slatebox-mcp
```

`SLATEBOX_BASE_URL` is optional; set it to your own server's address for a self-hosted Slatebox. The skills work with either server, because both offer the same tool names. If you use the local server, you can disable the plugin's hosted `slatebox` server in `/mcp` so the tools are not listed twice.

### Codex and ChatGPT

- **From the directory**: open the plugin directory in ChatGPT or Codex, search for **Slatebox** and add it. *(Not yet submitted.)*
- **Codex, from GitHub**: Codex reads this repo's marketplace file directly:

  ```bash
  codex plugin marketplace add Slatebox/slatebox-plugin
  codex plugin add slatebox@slatebox
  codex mcp login slatebox
  ```

  The last command signs you in to Slatebox. `codex mcp list` then shows `slatebox` as logged in.
- **Codex, the server alone**: add the hosted server to `~/.codex/config.toml`:

  ```toml
  [mcp_servers.slatebox]
  url = "https://app.slatebox.com/mcp"
  ```

  then run `codex mcp login slatebox` to sign in.

## Repository layout

```text
plugin/.claude-plugin/plugin.json     Claude plugin manifest (shared name, version, description)
.claude-plugin/marketplace.json  makes this repo a one-plugin Claude marketplace
.mcp.json                        the hosted MCP server, for Claude
plugin/skills/<name>/SKILL.md         the seven skills, shared by Claude and OpenAI
plugin/commands/*.md                the three slash commands (Claude only)
assets/slatebox-icon-512.png     the icon
openai/listing.json              OpenAI-only listing fields, auth and review test cases
scripts/build-openai.mjs         builds and checks the OpenAI ZIP
SUBMISSION.md                    exact field values for both directories
```

Skills are written once. Their front matter holds only `name` and `description`, the subset both platforms accept.

## Build and check

```bash
npm install
npm run validate:claude        # claude plugin validate . --strict
npm run build:openai           # writes dist/slatebox-<version>-openai.zip
npm run build:openai:final     # also fails on anything that blocks submission
```

The OpenAI ZIP uses the portable Agent Plugins layout: `plugin.json` (with OpenAI fields under `extensions["com.openai"]`), `mcp.json`, `skills/` and `assets/`. The build checks field lengths, the category, URLs, icon size, brand-colour contrast, test cases, listing-copy rules and the agent-plugins.org 1.0.0 JSON schemas.

When you release, raise `version` in `plugin/.claude-plugin/plugin.json` (and `package.json`).

## Support

- Help and contact: [slatebox.com/contact](https://slatebox.com/contact/)
- Docs: [docs.slatebox.com](https://docs.slatebox.com/developers/slateboxapi/mcp/)
- Privacy: [slatebox.com/privacy](https://slatebox.com/privacy/) · Terms: [slatebox.com/terms](https://slatebox.com/terms/)

## License

MIT. See [LICENSE](LICENSE).
