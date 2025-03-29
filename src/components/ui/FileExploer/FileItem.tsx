import React, { useEffect, useState, useRef } from "react";
import styles from "./styles.module.css";
import { FileItem } from "@/types/types";
import { useWorkspace } from "@/context/WorkSpace/WorkspaceContext";
import SidebarContextMenu from "../ContextMenu/sidebar";
import useModal from "@/features/editor/hooks/useModal";


interface FileItemProps {
  file: FileItem;
  depth?: number
}

export const FileItemComponent = ({
  file,
  depth = 0,
}: FileItemProps) => {
  const { state, handleToggleExpand, handleActiveFile, handleActiveItem } = useWorkspace();
  const isExpanded = state.expandedFolders?.includes(file.path);
  const isSelected = state.activeFile?.path === file.path;

  const [contextMenuVisible, setContextMenuVisible] = useState(false);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(file.basename);
  const [modal, showModal] = useModal();
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerRef = useRef<React.MouseEvent>(null);


  useEffect(() => {
    if (editMode && inputRef.current) {
      setEditMode(true);
      // 延迟聚焦以确保DOM已更新
      setTimeout(() => {
        inputRef.current?.focus();
        // 选中文件名但不包括扩展名
        if (!file.isDirectory) {
          const lastDotIndex = file.name.lastIndexOf(".");
          if (lastDotIndex > 0) {
            inputRef.current?.setSelectionRange(0, lastDotIndex);
          } else {
            inputRef.current?.select();
          }
        } else {
          inputRef.current?.select();
        }
      }, 50);
    }
  }, [editMode, file.isDirectory, editMode]);

  const handleRename = () => {
    console.log("rename")
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInputName(file.basename); // 恢复原名称
      setEditMode(false);
      e.preventDefault();
    }
  };
  const handleOpen = () => {
    if (file.isDirectory) {
      handleToggleExpand(file)
    }
    if (file.isFile) {
      handleActiveFile(file.path);
    }
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleActiveItem(file);
    setContextMenuVisible(true);
    pointerRef.current = e;
  };



  return (
    <div
      style={{ paddingLeft: `${depth * 5}px`}}
      onContextMenu={(e: React.MouseEvent) =>
        handleContextMenu(e)
      }

    >
      <div
        className={`
          ${styles.fileItem} 
          ${file.isDirectory ? styles.directory : ""} 
          ${isSelected ? styles.selected : ""}`}
        onClick={handleOpen}
      >
        <i
          className={`${styles.icon + " " + (file.isDirectory ? (isExpanded ? "expand-more" : "expand-less") : null)} `}
        />
        {editMode ? (
          <form
            onSubmit={handleRename}
            onClick={(e) => e.stopPropagation()}
            className={styles.renameForm}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className={styles.renameInput}
            />
          </form>
        ) : (
          <span className={styles.fileName}>{file.name}</span>
        )}
      </div>
      {isExpanded &&
        file.folders.map((child) => (
          <FileItemComponent
            key={child.path}
            file={child}
            depth={depth + 1}
          />
        ))}
      {isExpanded &&
        file.files.map((child) => (
          <FileItemComponent
            key={child.path}
            file={child}
            depth={depth + 1}
          />
        ))}
      {contextMenuVisible &&
        pointerRef.current &&
        <SidebarContextMenu
          event={pointerRef.current}
          onClose={() => setContextMenuVisible(false)}
          item={file}
          hasPasteCache={false}
          showModal={showModal}
        />
      }
      {modal}
    </div>
  );
};
