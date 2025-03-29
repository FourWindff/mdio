import { FileItemComponent } from "./FileItem";
import styles from "./styles.module.css";
import { useWorkspace } from "@/context/WorkSpace/WorkspaceContext";



export default function FileExplorer() {
  
  const {
    state:{
      tree,
      workPath,
      isExpandedAll
    },
    handleToggleExpandAll,
    handleOpenDirectory,
    handleCreateFile,
    handleCreateFolder
  } = useWorkspace();


  return (
    <div className={styles.fileExplorer}>
      <div className={styles.actionButtons}>
        <button
          onClick={handleOpenDirectory}
          className={styles.actionButton}
          title="打开文件夹"
        >
          <i className="icon folder-open" />
        </button>
        {workPath && (
          <>
            <button
              onClick={handleCreateFile}
              className={styles.actionButton}
              title="新建文件"
            >
              <i className="icon file-plus"></i>
            </button>
            <button
              onClick={handleCreateFolder}
              className={styles.actionButton}
              title="新建文件夹"
            >
              <i className="icon folder-plus"></i>
            </button>
            <button
              onClick={handleToggleExpandAll}
              className={styles.actionButton}
              title={isExpandedAll ? "收起所有文件夹" : "展开所有文件夹"}
            >
              <i
                className={`icon ${isExpandedAll ? "unfold-less" : "unfold-more"}`}
              ></i>
            </button>
          </>
        )}
      </div>
      <div className={styles.fileList}>
        {tree?.folders.map((file) => (
          <FileItemComponent
            key={file.path}
            file={file}
          />
        ))}
        {tree?.files.map((file) => (
          <FileItemComponent
            key={file.path}
            file={file}
          />
        ))}
      </div>
    </div>
  );
}
