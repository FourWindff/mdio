import { FileItem, Tab } from "@/types/types";
import { initialWorkspaceState, WorkspaceState } from "./WorkspaceContext";
import { SortType } from "@electron/common/types";

export type WorkspaceAction =
  //初始化
  | { type: "SET_WORK_PATH"; payload: string }
  | { type: "SET_ACTIVE_FILE"; payload: FileItem }
  | { type: "SET_TREE"; payload: FileItem }
  | { type: "SET_TABS"; payload: Tab[] }
  | { type: "SET_EXPANDED_FOLDERS"; payload: string[] }
  | { type: "SET_EXPANDED_STATUS"; payload: boolean }
  | { type: "SET_SORT_TYPE"; payload: SortType }
//文件操作(除了FILE_ACTIVE都包括文件夹)
// | { type: "FILE_CREATE"; payload: FileItem }
// | { type: "FILES_COPY"; payload: FileItem[] }
// | { type: "FILES_CUT"; payload: FileItem[] }
// | { type: "CLEAR_CLIPBOARD" }
// | { type: "FILE_RENAME"; payload: { file: FileItem; newName: string } }
// | { type: "FILE_REMOVE"; payload: string }
// | { type: "FILE_EDITING"; payload: FileItem }
export const workspaceReducer = (
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState => {
  switch (action.type) {
    case "SET_WORK_PATH":
      return { ...initialWorkspaceState, workPath: action.payload };
    case "SET_TREE":
      return { ...state, tree: action.payload };
    case "SET_EXPANDED_FOLDERS":
      return { ...state, expandedFolders: action.payload };
    case "SET_SORT_TYPE":
      return { ...state, sortType: action.payload };
    case "SET_EXPANDED_STATUS":
      return { ...state, isExpandedAll: action.payload }
    case "SET_ACTIVE_FILE":
      return { ...state, activeFile: action.payload }
    case "SET_TABS":
      return { ...state, tabs: action.payload }


    default:
      return state;
  }
};

const sortFiles = (
  filetree: FileItem[],
  sortType: SortType = SortType.ALPHABETICAL_ASC
): FileItem[] => {
  return [...filetree].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    switch (sortType) {
      case SortType.ALPHABETICAL_ASC:
        return a.basename
          .toLowerCase()
          .localeCompare(b.basename.toLowerCase(), undefined, {
            sensitivity: "base",
            numeric: true,
          });
      case SortType.ALPHABETICAL_DESC:
        return b.basename
          .toLowerCase()
          .localeCompare(a.basename.toLowerCase(), undefined, {
            sensitivity: "base",
            numeric: true,
          });
      case SortType.CREATED_TIME_ASC:
        return (a.createTime || 0) - (b.createTime || 0);
      case SortType.CREATED_TIME_DESC:
        return (b.createTime || 0) - (a.createTime || 0);
      case SortType.MODIFIED_TIME_ASC:
        return (a.lastModifiedTime || 0) - (b.lastModifiedTime || 0);
      case SortType.MODIFIED_TIME_DESC:
        return (b.lastModifiedTime || 0) - (a.lastModifiedTime || 0);
      default:
        return a.basename.toLowerCase().localeCompare(b.basename.toLowerCase());
    }
  });
};

