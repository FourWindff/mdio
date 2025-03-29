import {type JSX, ReactNode, useMemo} from "react";
import {createEmptyHistoryState} from "@lexical/react/LexicalHistoryPlugin";
import {
  ShareHistoryContext
} from "@/features/editor/context/ShareHistory/SharedHistoryContext";


export const SharedHistoryProvider = ({
                                       children,
                                     }: {
  children: ReactNode;
}): JSX.Element => {
  const historyContext = useMemo(
    () => ({historyState: createEmptyHistoryState()}),
    [],
  );
  return (
    <ShareHistoryContext.Provider value={historyContext}>
      {children}
    </ShareHistoryContext.Provider>
  )
}
