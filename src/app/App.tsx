import Editor from "@/features/editor";
import { useState, useEffect, ReactNode, useRef, useCallback } from "react";
import "./App.css";
import FileExplorer from "@/components/ui/FileExploer";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { Welcome } from "@/components/ui/Welcome";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { Loading } from "@/components/ui/Loading";
import { FileItem } from "@/types/types";
import { ActivityTypes } from "@/context/AppState/AppStateContext";
import WorkSpaceProvider from "@/context/WorkSpace/WorkspaceProvider";
import { useWorkspace } from "@/context/WorkSpace/WorkspaceContext";


type Side = "left" | "right";
const FileViewer = ({
  file,
}: {
  file: FileItem;
}) => {
  const filename = file.name;
  const filepath = file.path;
  const extension = file.extension;
  const [data, setData] = useState<string | Uint8Array>();
  const [isLoading,setIsLoading]=useState(true);
  useEffect(() => {
    window.ipcRenderer.invoke("ask-for-read-file", filepath).then((data) => {
      setData(data);
      setIsLoading(false);
    })
  }, [filepath])


  const handleSave = async (content: string) => {
    console.log("save")
  };

  
  if(isLoading){
    return <Loading/>
  }
  switch (extension) {
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
      return (
        <ImageViewer
          src={`data:image/${extension};base64,${data}`}
          alt={file.name}
        />
      );
    case ".md":
      return data ? <div>{data as string}</div> : null;
    case ".pdf":
      return <PdfViewer filePath={file.path} />;
    case ".lexical":
      return (
        <Editor
          key={file.path}
          initialContent={data as string}
          onSave={handleSave}
        />
      );
    default:
      return <div>暂不支持此格式</div>;
  }
};
const Content = () => {
  const {
    state: {
      workPath,
      activeFile,
      tabs,
    },
    handleActiveTab,
    handleCloseTab
  } = useWorkspace();


  return (
    <div className="content-container">
      {tabs.length > 0 && (
        <div className="tabs-bar">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              className={`tab ${activeFile?.path === tab.path ? "active" : ""}`}
              onClick={() => handleActiveTab(tab.path)}
            >
              <span className="tab-name">{tab.name}</span>
              <button className="tab-close" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCloseTab(tab.path);

              }}>
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="file-content">
        {!workPath && <Welcome />}
        {!!workPath && !activeFile && <div className="empty-state">请选择一个文件</div>}
        {activeFile && <FileViewer file={activeFile} />}
      </div>
    </div>
  );
};
const Header = ({
  isRightVisible,
  onToggleRight,
}: {
  isRightVisible: boolean;
  onToggleRight: () => void;
}) => {
  return (
    <div className="app-header">
      <div className="app-header-left">
        <i className="icon logo" />
        <span className="app-title">Rich Text Editor</span>
      </div>
      <div className="app-header-right">
        <button
          className={`icon-btn  ${isRightVisible ? "active" : ""}`}
          onClick={onToggleRight}
        >
          <i className="icon sidebar-right" />
        </button>
        <div className="window-controls">
          <button
            className="icon-btn"
            onClick={() => {
              window.ipcRenderer.send("minimize-window");
            }}
          >
            <i className="icon minimize" />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              window.ipcRenderer.send("maximize-window");
            }}
          >
            <i className="icon maximize" />
          </button>
          <button
            className="icon-btn close"
            onClick={() => {
              window.ipcRenderer.send("close-window");
            }}
          >
            <i className="icon close" />
          </button>
        </div>
      </div>
    </div>
  );
};
const ActivityBar = ({
  activity,
  onActivityChange,
  onToggleLeft,
}: {
  activity: ActivityTypes;
  onToggleLeft: () => void;
  onActivityChange: (activityType: ActivityTypes) => void;
}) => {
  return (
    <div className="activity-bar">
      <div className="activity-bar-buttons">
        <button
          className={`activity-button ${activity === "leftSidebar" ? "active" : ""
            }`}
          onClick={() => {
            onActivityChange("leftSidebar");
            onToggleLeft();
          }}
        >
          <i className="icon sidebar-left" />
        </button>
        <button
          className={`activity-button ${activity === "search" ? "active" : ""}`}
          onClick={() => onActivityChange("search")}
        >
          <i className="icon search" />
        </button>
      </div>
      <div className="activity-bar-bottom">
        <button
          className={`activity-button ${activity === "settings" ? "active" : ""
            }`}
          onClick={() => {
            onActivityChange("settings");
            window.electron.store.clear();
          }}
        >
          <i className="icon setting" />
        </button>
      </div>
    </div>
  );
};
const Sidebar = ({
  children,
  side,
  isVisible,
  onCollapsed,
}: {
  children: ReactNode;
  side: Side;
  isVisible: boolean;
  onCollapsed: (collapsed: boolean) => void;
}) => {
  const [width, setWidth] = useState<number>(0);
  const minWidth = 200;
  const resizeBarRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [isVisible]);

  // useEffect(() => {
  //   window.electron.store.get(`sidebar.${side}`, minWidth).then((value) => {
  //     setWidth(value as number);
  //   });
  // }, [side]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (resizeBarRef.current) {
        const tol = 100;
        const rect = resizeBarRef.current.getBoundingClientRect();
        if (side === "left") {
          const offsetX = e.clientX - rect.left;
          if (offsetX > minWidth - tol) {
            setCollapsed(false);
            onCollapsed(false);
          } else {
            setCollapsed(true);
            onCollapsed(true);
          }
        }
        if (side === "right") {
          const offsetX = rect.right - e.clientX;
          if (offsetX > minWidth - tol) {
            setCollapsed(false);
            onCollapsed(false);
          } else {
            setCollapsed(true);
            onCollapsed(true);
          }
        }
      }
    },
    [onCollapsed, side]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);


  useEffect(() => {
    const targetElement = resizeBarRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > minWidth) {
          window.electron.store.set(`sidebar.${side}`, width);
        }
      }
    });
    if (targetElement) {
      resizeObserver.observe(targetElement);
    }
    return () => {
      if (targetElement) {
        resizeObserver.unobserve(targetElement);
      }
    };
  }, [side]);

  return (
    <div className={`sidebar ${side} `}>
      <div
        className={`resize-bar ${collapsed ? "collapsed" : ""}`}
        style={{ [`--${side}-width`]: `${width}px` } as React.CSSProperties}
        ref={resizeBarRef}
        onMouseDown={() => {
          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      />
      <div className="resize-handle" />
      <div className="sidebar-content">{children}</div>
    </div>
  );
};

function App() {
  const [isLeftVisible, setIsLeftVisible] = useState<boolean>(false);
  const [isRightVisible, setIsRightVisible] = useState<boolean>(false);
  const [activity, setActivity] = useState<ActivityTypes>(undefined);


  const handleActivityChange = (activityType: ActivityTypes) => {
    if (activityType === activity) {
      setActivity(undefined);
      return;
    }
    setActivity(activityType);
  };

  const handleCollapsed = useCallback((collapsed: boolean) => {
    if (collapsed) {
      setIsLeftVisible(false);
      setActivity(undefined);
    } else {
      setIsLeftVisible(true);
      setActivity("leftSidebar");
    }
  }, []);


  return (
    <WorkSpaceProvider>
      <div className="app">
        <div className="app-top">
          <Header
            isRightVisible={isRightVisible}
            onToggleRight={() => setIsRightVisible((prev) => !prev)}
          />
        </div>
        <div className="app-main">
          <ActivityBar
            activity={activity}
            onActivityChange={handleActivityChange}
            onToggleLeft={() => setIsLeftVisible((prev) => !prev)}
          />
          <Sidebar
            isVisible={isLeftVisible}
            side="left"
            onCollapsed={handleCollapsed}
          >
            <FileExplorer />
          </Sidebar>

          <div className="app-content">
            <Content />
          </div>

          <Sidebar
            side="right"
            isVisible={isRightVisible}
            onCollapsed={(collapsed: boolean) => {
              if (collapsed) {
                setIsRightVisible(false);
              } else {
                setIsRightVisible(true);
              }
            }}
          >
            <h2>RightSidebar</h2>
          </Sidebar>
        </div>
      </div>
    </WorkSpaceProvider>
  );
}
export default App;
