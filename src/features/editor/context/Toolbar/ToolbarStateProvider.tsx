import {useCallback, useEffect, useMemo, useState, ReactNode} from 'react';
import {
  ToolbarStateContext,
  INITIAL_TOOLBAR_STATE,
  ToolbarStateKey,
  ToolbarStateValue
} from "@/features/editor/context/Toolbar/ToolbarStateContext";




export const ToolbarStateProvider =
  ({children}: { children: ReactNode }): JSX.Element => {
    const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);
    const selectionFontSize = toolbarState.fontSize;

    const updateToolbarState = useCallback(
      <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
        setToolbarState((prev) => ({
          ...prev,
          [key]: value,
        }));
      },
      [],
    );

    useEffect(() => {
      updateToolbarState('fontSizeInputValue', selectionFontSize.slice(0, -2));
    }, [selectionFontSize, updateToolbarState]);

    const contextValue = useMemo(() => {
      return {
        toolbarState,
        updateToolbarState,
      };
    }, [toolbarState, updateToolbarState]);

    return <ToolbarStateContext.Provider value={contextValue}>{children}</ToolbarStateContext.Provider>;
  };