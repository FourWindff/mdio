import { ReactNode, useCallback, useMemo, useState } from "react";
import { EDITOR_INITIAL_SETTINGS, EditorSettingName } from "../../editorSettings";
import { SettingsContext } from "./EditorSettingsContext";

export const SettingsProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [settings, setSettings] = useState(EDITOR_INITIAL_SETTINGS);

  const setOption = useCallback((setting: EditorSettingName, value: boolean) => {
    setSettings((options) => ({
      ...options,
      [setting]: value,
    }));
  }, []);

  const contextValue = useMemo(() => {
    return { setOption, settings };
  }, [setOption, settings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

