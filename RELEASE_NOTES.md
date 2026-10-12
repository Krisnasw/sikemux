# Sikemux v0.5.2-nightly.1

The first nightly on the 0.5.2 line. Nightlies are signed and delivered exactly like stable releases, but they carry unreleased work and can break. Switch back to stable in Settings → About whenever you want; you keep the build you are on until a stable release passes it.

## New since 0.5.1

- **Slack.** A new Slack plugin signs in with a Slack app's token, for one or more workspaces, and keeps each token in the Keychain. A Slack pane shows channels, messages and threads; reply in them, open links, and send a thread to an agent. Agents get `slack_thread`, `slack_search`, `slack_post` and `slack_user`, and Slack links in a chat are marked.
- **Subagents in the chat.** A subagent's own subagents stay inside its card, a resumed one reopens its card and stops spinning when it finishes, background subagents stay visible after you stop a turn, and a reloaded Claude chat shows them as they ended. A background shell says which subagent started it, and a turn says which background work woke the agent.
- **Jira.** Filter an issue list by status, with a count for each. Agents can file an epic's children, edit issues and link them.
- **Markdown files** open in preview, and in source when opened at a line. Enter in the find box goes to the next match.
- Copy a table in a chat as markdown.
- A turn that only thought folds under "Thought for", and shown pages and running subagents stay out of the folded work.
- Streaming text stays whole when a task notice lands mid-reply.
- Moving an agent to another project no longer freezes tab switching, and All projects orders done and idle agents by when they last worked.
- Agents prefer a plugin's tools over another server's for the same service.

Thanks to Ankit Patidar for the Slack plugin, the Jira status filter and the find box fix.

For the complete patch history, compare [`v0.5.1-nightly.7...v0.5.2-nightly.1`](https://github.com/nodelike/sikemux/compare/v0.5.1-nightly.7...v0.5.2-nightly.1).
