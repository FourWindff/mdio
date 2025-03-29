import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  LexicalNode,
  $isRootNode,
} from "lexical";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { defaultClient as geminiClient } from "@electron/main/gemini";
import "./index.css";
import { PLAYGROUND_TRANSFORMERS } from "../MarkdownTransformers";


// 定义对话框组件的属性
interface GeminiDialogProps {
  activeEditor: LexicalEditor;
  onClose: () => void;
}

// Gemini AI 对话框组件
export function GeminiDialog({ activeEditor, onClose }: GeminiDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setSelectedText(selection.getTextContent());
      }
    });
  }, [activeEditor]);

  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const contextPrompt = selectedText
        ? `以下是我选中的内容：\n\n${selectedText}\n\n${prompt}\n请用 Markdown 格式回复。`
        : `${prompt}\n请用 纯Markdown格式回复,开头和结尾不需要任何标识符。`;
      const response = await geminiClient.sendMessage(contextPrompt);
      console.log(response.content);
      insertMarkdownToEditor(activeEditor, response.content);
      onClose();
    } catch (error) {
      console.error("Gemini 内容生成错误:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gemini-dialog">
      <div className="gemini-dialog-body">
        <div className="input-section">
          <textarea
            id="gemini-prompt"
            className="gemini-prompt"
            placeholder="例如：'解释这段文字'、'润色这段文本'、'提供更多相关信息'、'写一段关于...'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="gemini-dialog-footer">
        <button
          className="secondary-button"
          onClick={() => {
            setPrompt("生成一段md字符串我想用来测试我的编辑器");
          }}
          disabled={isLoading}
        >
          测试
        </button>
        <button
          className="secondary-button"
          onClick={onClose}
          disabled={isLoading}
        >
          取消
        </button>
        <button
          className="primary-button"
          onClick={handleGenerateContent}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <span className="loading-text">生成中</span>
          ) : (
            "生成内容"
          )}
        </button>
      </div>
    </div>
  );
}

function insertMarkdownToEditor(editor: LexicalEditor, insertMarkdown: string) {
  editor.update(() => {
    editor.focus();
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      //FIXME 在编辑器没有聚焦的时候会触发
      console.log("不是范围选择")
      return;
    }
    const anchorNode = selection.anchor.getNode();
    const parentNode = anchorNode.getParent();

    if (parentNode === null) {
      return;
    }
    let targetNode=$isRootNode(parentNode) ? anchorNode : parentNode


    const tempContainer = $createParagraphNode();
    $convertFromMarkdownString(
      insertMarkdown,
      PLAYGROUND_TRANSFORMERS,
      tempContainer
    );
    let baseNode: LexicalNode = $createParagraphNode();
    targetNode.insertAfter(baseNode);

    tempContainer.getChildren().forEach((child) => {
      console.log("child",child)
      baseNode.insertBefore(child);
    });
    baseNode.remove();
  });
}

// 主插件组件（只是钩子，不需要渲染任何内容）
export default function GeminiPlugin(): null {
  const [editor] = useLexicalComposerContext();

  // 可以在这里添加键盘快捷键或其他逻辑

  return null;
}
