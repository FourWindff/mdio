/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor, NodeKey } from "lexical";
import type { JSX } from "react";

import "./StickyNode.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { $getNodeByKey } from "lexical";
import { useEffect, useLayoutEffect, useRef } from "react";
import StickyEditorTheme from "../themes/StickyEditorTheme";
import { $isStickyNode } from "./StickyNode";

import ContentEditable from "@/components/ui/ContentEditable";
import { useSharedHistory } from "../context/ShareHistory/SharedHistoryContext";

type Positioning = {
  isDragging: boolean;
  offsetX: number;
  offsetY: number;
  rootElementRect: null | ClientRect;
  x: number;
  y: number;
};

function positionSticky(
  stickyElem: HTMLElement,
  positioning: Positioning
): void {
  const style = stickyElem.style;
  // const rootElementRect = positioning.rootElementRect;
  // const rectLeft = rootElementRect !== null ? rootElementRect.left : 0;
  // const rectTop = rootElementRect !== null ? rootElementRect.top : 0;
  // style.top = rectTop + positioning.y + "px";
  // style.left = rectLeft + positioning.x + "px";
  style.top = positioning.y + "px";
  style.left = positioning.x + "px";
}
//TODO 当滚动编辑器之后再移动sticky会有偏移
export default function StickyComponent({
  x,
  y,
  nodeKey,
  color,
  caption,
}: {
  caption: LexicalEditor;
  color: "pink" | "yellow";
  nodeKey: NodeKey;
  x: number;
  y: number;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const stickyContainerRef = useRef<null | HTMLDivElement>(null);
  const positioningRef = useRef<Positioning>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    rootElementRect: null,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const position = positioningRef.current;
    position.x = x;
    position.y = y;
    const stickyContainer = stickyContainerRef.current;
    if (stickyContainer !== null) {
      positionSticky(stickyContainer, position);
    }
  }, [x, y]);

  useLayoutEffect(() => {
    const fileContent = document.querySelector(".file-content");
    const position = positioningRef.current;
    const rootElement = editor.getRootElement();

    if (rootElement) {
      position.rootElementRect = rootElement.getBoundingClientRect();
    }

    // 添加编辑器滚动事件处理
    const handleEditorScroll = () => {
      const rootElement = editor.getRootElement();
      const stickyContainer = stickyContainerRef.current;
      if (
        rootElement !== null &&
        stickyContainer !== null &&
        !positioningRef.current.isDragging
      ) {
        const position = positioningRef.current;
        position.rootElementRect = rootElement.getBoundingClientRect();
      }
    };

    if (fileContent) {
      fileContent.addEventListener("scroll", handleEditorScroll);
    }
    return () => {
      if (fileContent) {
        fileContent.removeEventListener("scroll", handleEditorScroll);
      }
    };
  }, [editor]);

  useEffect(() => {
    const stickyContainer = stickyContainerRef.current;
    if (stickyContainer !== null) {
      // Delay adding transition so we don't trigger the
      // transition on load of the sticky.
      setTimeout(() => {
        stickyContainer.style.setProperty(
          "transition",
          "top 0.3s ease 0s, left 0.3s ease 0s"
        );
      }, 500);
    }
  }, []);

  const handlePointerMove = (event: PointerEvent) => {
    const stickyContainer = stickyContainerRef.current;
    const positioning = positioningRef.current;
    const rootElementRect = positioning.rootElementRect;
    if (
      stickyContainer !== null &&
      positioning.isDragging &&
      rootElementRect !== null
    ) {
      positioning.x =
        event.clientX - rootElementRect.left - positioning.offsetX;
      positioning.y = event.clientY - rootElementRect.top - positioning.offsetY;
      positionSticky(stickyContainer, positioning);
    }
  };

  const handlePointerUp = (event: PointerEvent) => {
    const stickyContainer = stickyContainerRef.current;
    const positioning = positioningRef.current;

    if (stickyContainer !== null) {
      positioning.isDragging = false;
      stickyContainer.classList.remove("dragging");

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isStickyNode(node)) {
          node.setPosition(positioning.x, positioning.y);
        }
      });
    }

    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const handleDelete = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStickyNode(node)) {
        node.remove();
      }
    });
  };

  const handleColorChange = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStickyNode(node)) {
        node.toggleColor();
      }
    });
  };

  const { historyState } = useSharedHistory();

  return (
    <div ref={stickyContainerRef} className="sticky-note-container">
      <div
        className={`sticky-note ${color}`}
        onPointerDown={(event) => {
          const stickyContainer = stickyContainerRef.current;
          if (
            stickyContainer == null ||
            event.button === 2 ||
            event.target !== stickyContainer.firstChild
          ) {
            // Right click or click on editor should not work
            return;
          }

          const stickContainer = stickyContainer;
          const positioning = positioningRef.current;
          const editorRoot = editor.getRootElement();

          if (stickContainer !== null && editorRoot !== null) {
            // 获取当前位置信息
            const { top, left } = stickContainer.getBoundingClientRect();
            // 获取鼠标相对于便签的偏移
            positioning.offsetX = event.clientX - left;
            positioning.offsetY = event.clientY - top;
            positioning.isDragging = true;
            stickContainer.classList.add("dragging");
            document.addEventListener("pointermove", handlePointerMove);
            document.addEventListener("pointerup", handlePointerUp);
            event.preventDefault();
          }
        }}
      >
        <button
          onClick={handleDelete}
          className="delete"
          aria-label="Delete sticky note"
          title="Delete"
        >
          X
        </button>
        <button
          onClick={handleColorChange}
          className="color"
          aria-label="Change sticky note color"
          title="Color"
        >
          <i className="bucket" />
        </button>
        <LexicalNestedComposer
          initialEditor={caption}
          initialTheme={StickyEditorTheme}
        >
          <HistoryPlugin externalHistoryState={historyState} />

          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                placeholder="What's up?"
                placeholderClassName="StickyNode__placeholder"
                className="StickyNode__contentEditable"
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalNestedComposer>
      </div>
    </div>
  );
}
