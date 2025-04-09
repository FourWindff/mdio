import { FileItem, Tab } from "@/types/types";
import { createContext, Dispatch, useContext } from "react";
import { SortType } from "@electron/common/types";
import { WorkspaceAction } from "./WorkspaceReducer";

export interface WorkspaceState {
  workPath: string | null;
  tree: FileItem | null;
  tabs: Tab[];
  activeFile: FileItem | null;
  expandedFolders: string[];
  isExpandedAll:boolean;
  sortType: SortType;
  //以下状态无需通过保存
  clipboard: {
    items: FileItem[];
    operation: "copy" | "cut" | null;
  };
  renameCache:string| null;
  pasteCache:FileItem[];
  
}
export const initialWorkspaceState: WorkspaceState = {
  workPath: null,
  tree: null,
  tabs: [],
  activeFile: null,
  expandedFolders: [],
  isExpandedAll:false,
  sortType: SortType.ALPHABETICAL_ASC,
  clipboard: {
    items: [],
    operation: null,
  },
  renameCache:null,
  pasteCache:[]
};

export interface WorkspaceContextShape {
  state: WorkspaceState;
  dispatch:Dispatch<WorkspaceAction>
  handleActiveFile: (filePath: string) => void;
  handleActiveTab: (filePath: string) => void;
  handleCloseTab: (filePath: string) => void;
  handleCloseAllTabs: () => void;
  handleToggleExpand: (item: FileItem) => void;
  handleToggleExpandAll: () => void;
  handleOpenDirectory: () => void;
  handleCreateFile: () => void;
  handleCreateFolder: () => void;
  handleActiveItem:(item: FileItem) => void;
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
