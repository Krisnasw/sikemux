import type { JiraBoardView, JiraColumn } from "./api";

export interface BoardPerson {
    accountId: string;
    name: string;
    count: number;
}

/** Everyone with a card on the board, busiest first. */
export function boardPeople(board: JiraBoardView): BoardPerson[] {
    const people = new Map<string, BoardPerson>();
    for (const issue of board.columns.flatMap((column) => column.issues)) {
        if (!issue.assignee) continue;
        const seen = people.get(issue.assignee.accountId);
        if (seen) seen.count += 1;
        else people.set(issue.assignee.accountId, { ...issue.assignee, count: 1 });
    }
    return [...people.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const unassignedCount = (board: JiraBoardView) =>
    board.columns.reduce((total, column) => total + column.issues.filter((issue) => !issue.assignee).length, 0);

/** The same picks always make the same key, so a board narrowed to them is fetched once. */
export const pickKey = (picked: ReadonlySet<string>) => [...picked].sort().join(",");

/** The cards whose key or title holds the typed words. */
export function matchingCards(columns: JiraColumn[], words: string): JiraColumn[] {
    const needle = words.trim().toLowerCase();
    if (!needle) return columns;
    return columns.map((column) => ({
        ...column,
        issues: column.issues.filter((issue) => issue.key.toLowerCase().includes(needle) || issue.summary.toLowerCase().includes(needle)),
    }));
}
