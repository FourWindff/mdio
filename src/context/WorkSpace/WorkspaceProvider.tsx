import { ReactNode, useCallback, useEffect, useReducer } from "react";
import { workspaceReducer } from "./WorkspaceReducer";
import { initialWorkspaceState, WorkspaceContext } from "./WorkspaceContext";
import { FileItem, Tab } from "@/types/types";
import { IpcRendererEvent } from "electron";
import { NEW_DIRECTORY, NEW_FILE } from "@/components/ui/ContextMenu/sidebar";


export default function WorkSpaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);

  useEffect(() => {
    const handleinitWorkspace = (
      _: IpcRendererEvent,
      {
        workPath,
        activeFile,
        tabs,
        expandedFolders,
        isExpandedAll
      }
        :
        {
          workPath: string,
          activeFile: FileItem,
          tabs: Tab[],
          expandedFolders: string[]
          isExpandedAll: boolean
        }) => {
      console.log("初始化数据", workPath, activeFile, tabs, expandedFolders, isExpandedAll)
      !!workPath && dispatch({ type: "SET_WORK_PATH", payload: workPath });
      !!activeFile && dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
      dispatch({ type: "SET_TABS", payload: tabs });
      dispatch({ type: "SET_EXPANDED_STATUS", payload: isExpandedAll });
      dispatch({ type: "SET_EXPANDED_FOLDERS", payload: expandedFolders });
    }
    const handleUpdateWorkspace = (
      _: IpcRendererEvent,
      { tree, activeFile, tabs, expandedFolders, isExpandedAll }:
        { tree: FileItem, activeFile: FileItem, tabs: Tab[], expandedFolders: string[], isExpandedAll: boolean }) => {
      dispatch({ type: "SET_TREE", payload: tree });
      dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
      dispatch({ type: "SET_TABS", payload: tabs });
      dispatch({ type: "SET_EXPANDED_FOLDERS", payload: expandedFolders });
      dispatch({ type: "SET_EXPANDED_STATUS", payload: isExpandedAll });
    }

    window.ipcRenderer.on("init-workspace", handleinitWorkspace)
    window.ipcRenderer.on("UPDATE_WORKSPACE", handleUpdateWorkspace)
    return () => {
      window.ipcRenderer.off("init-workspace", handleinitWorkspace);
      window.ipcRenderer.off("UPDATE_WORKSPACE", handleUpdateWorkspace);
    }
  }, []);

  const handleActiveFile = useCallback((filePath: string) => {
    if (filePath === state.activeFile?.path) return;
    window.ipcRenderer.invoke("active-file", filePath).then(({ activeFile, tabs }) => {
      console.log("当前选中的文件以及标签页:", activeFile, tabs);
      dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
      dispatch({ type: "SET_TABS", payload: tabs });
    })
  }, [state.activeFile?.path]);
  const handleActiveTab = useCallback((filePath: string) => {
    if (filePath === state.activeFile?.path) return;
    window.ipcRenderer.invoke("active-tab", filePath).then(({ activeFile }) => {
      console.log("当前选中的文件以及标签页:", activeFile);
      dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
    })
  }, [state.activeFile?.path])
  const handleCloseTab = useCallback((filePath: string) => {
    window.ipcRenderer.invoke("close-tab", filePath).then(({ activeFile, tabs }) => {
      console.log("当前选中的文件以及标签页:", activeFile, tabs);
      dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
      dispatch({ type: "SET_TABS", payload: tabs });
    })
  }, []);
  const handleCloseAllTabs = useCallback(() => {
    window.ipcRenderer.invoke("close-all-tabs").then(({ activeFile, tabs }) => {
      console.log("当前选中的文件以及标签页:", activeFile, tabs);
      dispatch({ type: "SET_ACTIVE_FILE", payload: activeFile });
      dispatch({ type: "SET_TABS", payload: tabs });
    })
  }, []);
  const handleToggleExpand = useCallback((item: FileItem) => {
    if (item.isFile) return;
    window.ipcRenderer.invoke("toggle-expand", item.path).then(({ expandedFolders, isExpandedAll }) => {
      console.log("expandedFolders from main:", expandedFolders);
      dispatch({ type: "SET_EXPANDED_FOLDERS", payload: expandedFolders });
      dispatch({ type: "SET_EXPANDED_STATUS", payload: isExpandedAll });
    })
  }, [])
  const handleToggleExpandAll = useCallback(() => {
    window.ipcRenderer.invoke("toggle-expand-all").then(({ expandedFolders, isExpandedAll }) => {
      console.log("expandedFolders from main:", expandedFolders);
      dispatch({ type: "SET_EXPANDED_FOLDERS", payload: expandedFolders });
      dispatch({ type: "SET_EXPANDED_STATUS", payload: isExpandedAll });
    })
  }, []);

  const handleOpenDirectory = useCallback(() => {
    window.ipcRenderer.invoke("ask-for-open-directory").then((path) => {
      if (!path) return;
      dispatch({ type: "SET_WORK_PATH", payload: path });
    })
  }, []);

  const handleActiveItem = useCallback((item: FileItem) => {
    dispatch({ type: "SET_ACTIVE_ITEM", payload: item });
  }, [])


  const handleCreateFile = useCallback(() => {
    window.ipcRenderer.send("ask-for-create-file", state.workPath, NEW_FILE);
  }, []);
  const handleCreateFolder = useCallback(() => {
    window.ipcRenderer.send("ask-for-create-directory",state.workPath,NEW_DIRECTORY);
  }, []);




  // 提供上下文值
  const contextValue = {
    state,
    dispatch,
    handleActiveFile,
    handleActiveTab,
    handleCloseTab,
    handleCloseAllTabs,
    handleToggleExpand,
    handleToggleExpandAll,
    handleOpenDirectory,
    handleCreateFile,
    handleCreateFolder,
    handleActiveItem,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}
