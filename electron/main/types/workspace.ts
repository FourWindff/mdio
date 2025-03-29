


import  { Tab } from "@/types/types";
import { SortType } from "../../common/types";



export interface WorkspaceShape {
  activeFile: string | null;
  tabs:Tab[];
  expandedFolders: string[];
  sortBy:SortType;
  isExpandedAll:boolean
}
export const DEFAULT_WORKSPACE: Readonly<WorkspaceShape> = Object.freeze({
  activeFile: null,
  expandedFolders: [],
  tabs:[],
  sortBy: SortType.ALPHABETICAL_ASC,
  isExpandedAll:false,
});
