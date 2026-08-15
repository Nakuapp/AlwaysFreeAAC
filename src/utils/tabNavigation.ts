import type { KeyboardEvent } from "react";

export function handleTabKeyDown<TabId extends string>(
  event: KeyboardEvent<HTMLButtonElement>,
  tabIds: readonly TabId[],
  currentId: TabId,
  onSelect: (tabId: TabId) => void,
): void {
  const currentIndex = tabIds.indexOf(currentId);
  let nextIndex: number | undefined;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabIds.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabIds.length - 1;
  if (nextIndex === undefined) return;

  event.preventDefault();
  onSelect(tabIds[nextIndex]);
  const tabs =
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabs?.[nextIndex]?.focus();
}
