
export const EDITOR_DEFAULT_SETTINGS = {
  disableBeforeInput: false,
  hasLinkAttributes: false,
  isAutocomplete: false,
  isCharLimit: false,
  isCharLimitUtf8: false,
  measureTypingPerf: false,
  selectionAlwaysOnDisplay: false,
  shouldAllowHighlightingWithBrackets: false,
  shouldPreserveNewLinesInMarkdown: false,
  shouldUseLexicalContextMenu: false,
  showNestedEditorTreeView: false,
  showTableOfContents: false,
  showTreeView: true,
  tableCellBackgroundColor: true,
  tableCellMerge: true,
  tableHorizontalScroll: true,
} as const;

export const EDITOR_INITIAL_SETTINGS: Record<EditorSettingName, boolean> = {
  ...EDITOR_DEFAULT_SETTINGS,
};

export type EditorSettingName = keyof typeof EDITOR_DEFAULT_SETTINGS;

export type EditorSettings = typeof EDITOR_INITIAL_SETTINGS;
