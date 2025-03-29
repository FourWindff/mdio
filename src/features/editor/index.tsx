import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useEffect, useRef } from "react";

import Plugins from "@/features/editor/plugins";
import nodes from "@/features/editor/nodes";
import { ToolbarStateProvider } from "./context/Toolbar/ToolbarStateProvider";
import { SharedHistoryProvider } from "./context/ShareHistory/ShareHistoryProvider";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import { LexicalEditor } from "lexical";
import { SettingsProvider } from "./context/Settings/EditorSettingsProvider";

interface EditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}
//TODO 支持md复制粘贴
//TODO 字符转义
export default function Editor({ initialContent, onSave }: EditorProps) {
  const latestContentRef = useRef<string | null>(null);
  useEffect(() => {
    if (initialContent) {
      latestContentRef.current = initialContent;
    }
  }, [initialContent]);

  const initialConfig = {
    namespace: "MarkdownEditor",
    nodes: [...nodes],
    onError: (error: Error) => {
      console.error(error);
    },
    theme: PlaygroundEditorTheme,

    editorState: (editor: LexicalEditor) => {
      if (!initialContent) {
        return;
      }
      try {
        const parsedContent = JSON.parse(initialContent);
        const editorState = editor.parseEditorState(parsedContent.editorState);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Error loading Lexical file:", error);
      }
    },
  };

  return (
    <div className="editor-shell">
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryProvider>
          <ToolbarStateProvider>
            <SettingsProvider>
              <Plugins updateCacheSilently={onSave} />
            </SettingsProvider>
          </ToolbarStateProvider>
        </SharedHistoryProvider>
      </LexicalComposer>
    </div>
  );
}
