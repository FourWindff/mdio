import { FileItem } from "@/types/types";
import { createContext, useContext } from "react";

export type AppTheme = "light" | "dark" | "system";
export type ActivityTypes =
  | "leftSidebar"
  | "settings"
  | "search"
  | "gemini"
  | undefined;


// export type Tab={
//   file:FileItem;
//   index?:number;
//   isActive?:boolean;
// }

// export interface ContextShape {

// }

// export const AppStateContext = createContext<ContextShape | undefined>(
//   undefined
// );

// export const useAppState = () => {
//   const context = useContext(AppStateContext);
//   if (!context)
//     throw new Error("useAppState must be used within a AppStateProvider");
//   return context;
// };
