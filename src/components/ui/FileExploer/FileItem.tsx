import { useEffect, useState, useRef } from "react";
import styles from "./styles.module.css";
import { FileItem } from "@/types/types";
import ContextMenu, { MenuItem } from "../ContextMenu";
import useModal from "@/features/editor/hooks/useModal";
import { DialogActions } from "../Dialog/Dialog";
import Button from "../Button";
import { useWorkspace } from "@/context/WorkSpace/WorkspaceContext";

interface FileItemProps {
  file: FileItem;
  depth?: number
}

export const FileItemComponent = ({
  file,
  depth = 0,
}: FileItemProps) => {
  const { state, handleToggleExpand, handleActiveFile } = useWorkspace();
  const isExpanded = state.expandedFolders?.includes(file.path);
  const isSelected=state.activeFile?.path===file.path;


  const [editMode, setEditMode] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(file.basename);
  const [contextMenuVisible, setContextMenuVisible] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [modal, showModal] = useModal();

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
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setInputName(file.basename); // 恢复原名称
      setEditMode(false);
      e.preventDefault();
    }
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    pointRef.current = { x: e.clientX, y: e.clientY };
    setContextMenuVisible(true);
  };
  const handleOpen = () => {
    if (file.isDirectory) {
      handleToggleExpand(file)
    }
    if (file.isFile) {
      handleActiveFile(file.path);
    }
  }

  return (
    <div
      style={{ paddingLeft: `${depth * 8}px` }}
      onContextMenu={handleContextMenu}
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
          <span className={styles.fileName}>{file.basename}</span>
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
      {/* 这个需要移动到外面,每个组件都加一个会有性能开销嘛 */}
      {contextMenuVisible && (
        <ContextMenu
          pointRef={pointRef}
          onClose={() => setContextMenuVisible(false)}
        >
          <MenuItem
            onClick={() => alert("复制")}
            iconClassName="file-copy"
            title="复制"
          />
          <MenuItem
            onClick={() => alert("粘贴")}
            iconClassName="file-paste"
            title="粘贴"
          />
          <MenuItem
            onClick={() => alert("移动")}
            iconClassName="file-move"
            title="移动"
          />
          <MenuItem
            onClick={() => setEditMode(true)}
            iconClassName="file-rename"
            title="重命名"
          />
          <MenuItem
            onClick={() =>
              showModal("确定删除嘛", (onClose) => (
                <>
                  <h2>删除之后不可恢复</h2>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        window.electron.deleteFile(file.path);
                        //移除相关状态
                      }}
                    >
                      确认
                    </Button>
                    <Button onClick={onClose}>取消</Button>
                  </DialogActions>
                </>
              ))
            }
            iconClassName="file-delete"
            title="删除"
          />
        </ContextMenu>
      )}
      {modal}
    </div>
  );
};
