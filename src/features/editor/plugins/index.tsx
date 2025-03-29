import { ReactNode, useState } from "react";
import { useSharedHistory } from "@/features/editor/context/ShareHistory/SharedHistoryContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import ToolbarPlugin from "@/features/editor/plugins/ToolbarPlugin";
import ShortcutsPlugin from "@/features/editor/plugins/ShortcutsPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import LexicalContentEditable from "@/components/ui/ContentEditable";
import FloatingLinkEditorPlugin from "./FloatingLinkEditorPlugin";
import { AutoSavePlugin } from "./AutoSavePlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import ImagesPlugin from "./ImagesPlugin";
import { useEditorSettings } from "../context/Settings/EditorSettingsContext";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import DragDropPastePlugin from "./DragDropPastePlugin";
import DraggableBlockPlugin from "./DraggableBlockPlugin";
import TableActionMenuPlugin from "./TableActionMenuPlugin";
import TableCellResizerPlugin from "./TableCellResizerPlugin";
import TableHoverActionsPlugin from "./TableHoverActionsPlugin";
import CodeActionMenuPlugin from "./CodeActionMenuPlugin";
import AutoLinkPlugin from "./AutoLinkPlugin";
import CodeHighlightPlugin from "./CodeHighlightPlugin";
import EquationsPlugin from "./EquationsPlugin";
import { LayoutPlugin } from "./LayoutPlugin/LayoutPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import TreeViewPlugin from "./TreeViewPlugin";
import ComponentPickerPlugin from "./ComponentPickerPlugin";
import CommentPlugin from "./CommentPlugin";
import FloatingTextFormatToolbarPlugin from "./FloatingTextFormatToolbarPlugin";

export default function Plugins({
  updateCacheSilently,
}: {
  updateCacheSilently: (content: string) => void;
}): ReactNode {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const { historyState } = useSharedHistory();
  //const isEditable = useLexicalEditable();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  //TODO APP、Editor设置使用context
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
      tableHorizontalScroll,
      shouldAllowHighlightingWithBrackets,
      selectionAlwaysOnDisplay,
    },
  } = useEditorSettings();

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const handleAutoSave = async (content: string) => {
    updateCacheSilently(content);
  };

  return (
    <>
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <AutoSavePlugin onSave={handleAutoSave} />
      <div className={`editor-container tree-view}`}>
        <AutoLinkPlugin />
        <AutoFocusPlugin />
        <CheckListPlugin />
        <ClearEditorPlugin />
        <CodeHighlightPlugin />
        <DragDropPastePlugin />
        <EquationsPlugin />
        <HistoryPlugin externalHistoryState={historyState} />
        <ListPlugin />
        <LinkPlugin />
        <LayoutPlugin />
        <MarkdownShortcutPlugin />
        <HorizontalRulePlugin />
        <ImagesPlugin />
        <TablePlugin
          hasCellMerge={tableCellMerge}
          hasCellBackgroundColor={tableCellBackgroundColor}
          hasHorizontalScroll={tableHorizontalScroll}
        />
        <TableCellResizerPlugin />
        <ComponentPickerPlugin />
        <CommentPlugin />
        {floatingAnchorElem && (
          <>
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <TableActionMenuPlugin anchorElem={floatingAnchorElem} />
            <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
          </>
        )}
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <LexicalContentEditable
                  className="contentEditable__root"
                  placeholder={"Enter some text..."}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
    </>
  );
}
