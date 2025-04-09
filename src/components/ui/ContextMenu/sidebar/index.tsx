import { FileItem } from "@/types/types";
import { ReactNode } from "react";
import ContextMenu, { MenuItem } from "..";
import Button from "../../Button";
import { DialogActions } from "../../Dialog/Dialog";
import { newDirectory, newFile, remove } from "./action";
import { useWorkspace } from "@/context/WorkSpace/WorkspaceContext";

interface props {
  onClose: () => void;
  event: React.MouseEvent;
  item: FileItem;
  hasPasteCache: boolean;
  showModal: (title: string, content: (closeModal: () => void) => ReactNode) => void;
}
export const NEW_FILE = "New File.lexical";
export const NEW_DIRECTORY = "New Directory";

export default function SidebarContextMenu({ event, onClose, item, hasPasteCache, showModal }: props) {
  const { dispatch } = useWorkspace()
  return (
    <ContextMenu
      onClose={onClose}
      event={event}
    >
      {item.isDirectory &&
        <MenuItem
          onClick={() => newFile(item.path, NEW_FILE)}
          title="New file"
          iconClassName="file-plus" />
      }
      {item.isDirectory &&
        <MenuItem
          onClick={() => newDirectory(item.path, NEW_DIRECTORY)}
          title="New directory"
          iconClassName="folder-plus" />
      }
      <MenuItem
        onClick={()=>{
          dispatch({type:"SET_PASTE_CACHE",payload:[item]})
          console.log("copy",[item])
        }}
        title="Copy"
        iconClassName="file-copy" />
      {hasPasteCache &&
        <MenuItem
          onClick={() => alert("paste")}
          title="paste"
          iconClassName="file-paste" />}
      <MenuItem
        onClick={()=>{
          dispatch({type:"SET_PASTE_CACHE",payload:[item]})
          console.log("cut",item)
        }}
        title="Cut"
        iconClassName="file-cut" />
      <MenuItem
        onClick={() => {
          dispatch({ type: "SET_RENAME_CACHE", payload: item.path })
          console.log("rename", item.path)
        }}
        title="Rename"
        iconClassName="file-rename" />

      <MenuItem
        onClick={() =>
          showModal("确定删除嘛", (closeModal) => (
            <>
              <h2>删除之后不可恢复</h2>
              <DialogActions>
                <Button
                  onClick={() => {
                    remove(item.path);
                    closeModal();
                  }}
                >
                  确认
                </Button>
                <Button onClick={closeModal}>取消</Button>
              </DialogActions>
            </>
          ))
        }
        iconClassName="file-delete"
        title="Remove"
      />
      <MenuItem
        onClick={() => alert(item.path)}
        title="文件路径"
        iconClassName="file-rename" />

    </ContextMenu>
  )
}
