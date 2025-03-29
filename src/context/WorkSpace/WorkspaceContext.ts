import { FileItem, Tab } from "@/types/types";
import { createContext, useContext } from "react";
import { SortType } from "@electron/common/types";

export interface WorkspaceState {
  workPath: string | null;
  tree: FileItem | null;
  tabs: Tab[];
  activeFile: FileItem | null;
  expandedFolders: string[];
  isExpandedAll:boolean;
  editingFile: FileItem | null;
  clipboard: {
    items: FileItem[];
    operation: "copy" | "cut" | null;
  };
  sortType: SortType;
}
export const initialWorkspaceState: WorkspaceState = {
  workPath: null,
  tree: null,
  tabs: [],
  activeFile: null,
  expandedFolders: [],
  isExpandedAll:false,
  editingFile: null,
  clipboard: {
    items: [],
    operation: null,
  },
  sortType: SortType.ALPHABETICAL_ASC,
};

export interface WorkspaceContextShape {
  state: WorkspaceState;
  handleActiveFile: (filePath: string) => void;
  handleActiveTab: (filePath: string) => void;
  handleCloseTab: (filePath: string) => void;
  handleCloseAllTabs: () => void;
  handleToggleExpand: (item: FileItem) => void;
  handleToggleExpandAll: () => void;
  handleOpenDirectory: () => void;
  handleCreateFile: () => void;
  handleCreateFolder: () => void;
}
export const WorkspaceContext = createContext<
  WorkspaceContextShape | undefined
>(undefined);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
}
