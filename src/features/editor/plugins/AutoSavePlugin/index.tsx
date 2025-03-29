import { useEffect, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import debounce, { DebouncedFunc } from "lodash-es/debounce";

interface AutoSavePluginProps {
  onSave: (content: string) => Promise<void>;
  debounceTime?: number;
}

export function AutoSavePlugin({
  onSave,
  debounceTime = 2000,
}: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const debouncedSaveRef = useRef<DebouncedFunc<typeof saveContent>>(null);
  const currentContentRef = useRef<string>(
    JSON.stringify({
      editorState: editor.getEditorState().toJSON(),
      lastModified: new Date().toISOString(),
    })
  );
  const lastSavedContentRef = useRef<string>(currentContentRef.current);

  const saveContent = useCallback(
    async (content: string) => {
      if (content === lastSavedContentRef.current) {
        return;
      }
      try {
        await onSave(content);
        console.log("保存成功");
        lastSavedContentRef.current = content;
      } catch (error) {
        console.error("保存失败:", error);
      }
    },
    [onSave]
  );


  //保存函数引用
  useEffect(() => {
    debouncedSaveRef.current = debounce(async (content: string) => {
      await saveContent(content);
    }, debounceTime);
  }, [saveContent, debounceTime]);

  // 注册编辑器自动保存
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const content = JSON.stringify({
        editorState: editorState.toJSON(),
        lastModified: new Date().toISOString(),
      });
      currentContentRef.current = content;
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current(content);
      }
    });
  }, [editor]);

  // 组件卸载时保存最新内容
  useEffect(() => {
    // const handleBeforeClose = async () => {
    //   if (debouncedSaveRef.current) {
    //     debouncedSaveRef.current.cancel();
    //   }
    //   if (currentContentRef.current !== lastSavedContentRef.current) {
    //     console.log("应用关闭，立即保存内容");
    //     await saveContent(currentContentRef.current);
    //     window.electron.notifySaveCompleted();
    //   }
    // };
    // window.electron.onBeforeClose(handleBeforeClose);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
      if (currentContentRef.current !== lastSavedContentRef.current) {
        console.log("组件卸载，保存最新内容");
        saveContent(currentContentRef.current);
      }
    };
  }, [saveContent]);

  return null;
}
