export type TitleBarStyle = "custom" | "native";
export type FileSortBy = "created" | "modified" | "name";
export type StartUpAction = "lastState" | "newFile" | "welcome";
export type EndOfLine = "default" | "lf" | "crlf";
export type ImageInsertAction = "path" | "upload";
export type TextDirection = "ltr" | "rtl";
export type FrontmatterType = "-" | "+" | "=";
export type ThemeType = "light" | "dark" | "system";
export type AutoSwitchTheme = 0 | 1 | 2; // 0: disabled, 1: follow system, 2: follow time

export interface Preferences {
  // 应用设置
  autoSave: boolean;
  autoSaveDelay: number;
  titleBarStyle: TitleBarStyle;
  openFilesInNewWindow: boolean;
  openFolderInNewWindow: boolean;
  zoom: number;
  hideScrollbar: boolean;
  wordWrapInToc: boolean;
  fileSortBy: FileSortBy;
  startUpAction: StartUpAction;
  defaultDirectoryToOpen: string;
  language: string;

  // 编辑器设置
  editorFontFamily: string;
  fontSize: number;
  lineHeight: number;
  codeFontSize: number;
  codeFontFamily: string;
  codeBlockLineNumbers: boolean;
  trimUnnecessaryCodeBlockEmptyLines: boolean;
  editorLineWidth: string | number;

  // 编辑行为
  autoPairBracket: boolean;
  autoPairMarkdownSyntax: boolean;
  autoPairQuote: boolean;
  endOfLine: EndOfLine;
  defaultEncoding: string;
  autoGuessEncoding: boolean;
  trimTrailingNewline: number;
  textDirection: TextDirection;
  hideQuickInsertHint: boolean;
  imageInsertAction: ImageInsertAction;
  imagePreferRelativeDirectory: boolean;
  imageRelativeDirectoryName: string;
  hideLinkPopup: boolean;
  autoCheck: boolean;

  // Markdown 格式设置
  preferLooseListItem: boolean;
  bulletListMarker: string;
  orderListDelimiter: string;
  preferHeadingStyle: string;
  tabSize: number;
  listIndentation: number;
  frontmatterType: FrontmatterType;
  superSubScript: boolean;
  footnote: boolean;
  isHtmlEnabled: boolean;
  isGitlabCompatibilityEnabled: boolean;
  sequenceTheme: string;

  // 主题设置
  theme: ThemeType;
  autoSwitchTheme: AutoSwitchTheme;

  // 拼写检查
  spellcheckerEnabled: boolean;
  spellcheckerNoUnderline: boolean;
  spellcheckerLanguage: string;

  // UI 设置
  sideBarVisibility: boolean;
  tabBarVisibility: boolean;
  sourceCodeModeEnabled: boolean;

  // 搜索设置
  searchExclusions: string[];
  searchMaxFileSize: string | number;
  searchIncludeHidden: boolean;
  searchNoIgnore: boolean;
  searchFollowSymlinks: boolean;

  // 文件监视
  watcherUsePolling: boolean;
  lastOpenFolder:string | null;
}

export const DEFAULT_PREFERENCES: Readonly<Preferences> = Object.freeze({
  // 应用设置
  autoSave: false,
  autoSaveDelay: 5000,
  titleBarStyle: "custom",
  openFilesInNewWindow: false,
  openFolderInNewWindow: false,
  zoom: 1.0,
  hideScrollbar: false,
  wordWrapInToc: false,
  fileSortBy: "created",
  startUpAction: "lastState",
  defaultDirectoryToOpen: "",
  language: "en",

  // 编辑器设置
  editorFontFamily: "Open Sans",
  fontSize: 16,
  lineHeight: 1.6,
  codeFontSize: 14,
  codeFontFamily: "DejaVu Sans Mono",
  codeBlockLineNumbers: true,
  trimUnnecessaryCodeBlockEmptyLines: true,
  editorLineWidth: "",

  // 编辑行为
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  endOfLine: "default",
  defaultEncoding: "utf8",
  autoGuessEncoding: true,
  trimTrailingNewline: 2,
  textDirection: "ltr",
  hideQuickInsertHint: false,
  imageInsertAction: "path",
  imagePreferRelativeDirectory: false,
  imageRelativeDirectoryName: "assets",
  hideLinkPopup: false,
  autoCheck: false,

  // Markdown 格式设置
  preferLooseListItem: true,
  bulletListMarker: "-",
  orderListDelimiter: ".",
  preferHeadingStyle: "atx",
  tabSize: 4,
  listIndentation: 1,
  frontmatterType: "-",
  superSubScript: false,
  footnote: false,
  isHtmlEnabled: true,
  isGitlabCompatibilityEnabled: false,
  sequenceTheme: "hand",

  // 主题设置
  theme: "light",
  autoSwitchTheme: 2,

  // 拼写检查
  spellcheckerEnabled: false,
  spellcheckerNoUnderline: false,
  spellcheckerLanguage: "en-US",

  // UI 设置
  sideBarVisibility: false,
  tabBarVisibility: false,
  sourceCodeModeEnabled: false,

  // 搜索设置
  searchExclusions: [],
  searchMaxFileSize: "",
  searchIncludeHidden: false,
  searchNoIgnore: false,
  searchFollowSymlinks: true,

  // 文件监视
  watcherUsePolling: false,
  lastOpenFolder: null,
});
