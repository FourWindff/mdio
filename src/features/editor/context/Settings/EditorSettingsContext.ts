import { createContext, useContext } from "react";
import { EditorSettingName } from "../../editorSettings";

export type SettingsContextShape = {
  setOption: (name: EditorSettingName, value: boolean) => void;
  settings: Record<EditorSettingName, boolean>;
};

export const SettingsContext = createContext<SettingsContextShape | undefined>(
  undefined
);

export const useEditorSettings = (): SettingsContextShape => {
  const context = useContext(SettingsContext);
  if(!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};

