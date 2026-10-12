import { agentLabel } from '@mac/agents/catalog';
import type { ChatInfo } from '@/core/protocol';

export function folder(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? path;
}

/** The title the agent gave the chat, as the Mac's rail shows it. */
export function chatTitle(chat: Pick<ChatInfo, 'title' | 'provider'>): string {
  return chat.title ?? `New ${agentLabel(chat.provider)} chat`;
}

/** The Mac rail's words for where a chat is (src/state/agentStatus.ts). */
export function chatState(chat: ChatInfo): string {
  if (chat.pendingPermissions.length) return 'Needs input';
  if (chat.asleep) return 'Sleeping';
  if (chat.state === 'stopped') return 'Stopped';
  if (chat.state === 'starting') return 'Starting…';
  return chat.running ? 'Working' : 'Ready';
}
