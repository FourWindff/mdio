import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import { Watcher } from "../fileSystem/watcher";
import { Preference } from "../preference";
import { Workspace } from "../workspace";
import log from "electron-log";
import { IMAGE_TYPE, TEXT_TYPE } from "../../common/types";
import { getUniquenName } from "../../common/filesystem/paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname,".." );

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

class App {
  private win: BrowserWindow | null;
  private watcher: Watcher;
  private preference: Preference;
  private workspace: Workspace | null = null;

  constructor() {
    const useDataPath = app.getPath("userData");
    this.win = null;
    this.preference = new Preference(useDataPath);
    this.watcher = new Watcher(this.preference);
    this._listenForIpcMain();
    this.listenForIpcRenderer();
  }

  init() {
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
        this.win = null;
      }
    });
    app.on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        this._createWindow();
      }
    });
    app.whenReady().then(() => {
      log.info("ready");
      this._createWindow();
    });
  }
  _createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      frame: false,
      icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
      webPreferences: {
        preload: path.join(__dirname, "preload.mjs"),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: true,
      },
    });
    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL);
    } else {
      win.loadFile(path.join(__dirname, "../../dist/index.html"));
    }
    ipcMain.on("minimize-window", () => {
      win.minimize();
    });
    ipcMain.on("maximize-window", () => {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    });
    ipcMain.on("close-window", () => {
      win.close();
    });
    win.webContents.on("did-finish-load", () => {
      const lastOpenFolder = this.preference.get("lastOpenFolder");
      if (lastOpenFolder) {
        this.workspace = new Workspace(win, lastOpenFolder);
        ipcMain.emit("watcher-watch-dir", null, win, lastOpenFolder);
      }
    });
    this.win = win;
  }

  _listenForIpcMain() {
    ipcMain.on("watcher-unwatch-all-by-id", (_, windowId) => {
      this.watcher.unwatchByWindowId(windowId);
    });
    ipcMain.on("watcher-watch-file", (_, win, filePath: string) => {
      this.watcher.watch(win, filePath, "file");
    });
    ipcMain.on("watcher-watch-dir", (_, win, pathname: string) => {
      this.watcher.watch(win, pathname, "dir");
    });
    ipcMain.on("watcher-unwatch-file", (_, win, filePath: string) => {
      this.watcher.unwatch(win, filePath, "file");
    });
    ipcMain.on("watcher-unwatch-dir", (_, win, pathname: string) => {
      log.info("移除监控:", pathname);
      this.watcher.unwatch(win, pathname, "dir");
    });
    ipcMain.on("set-work-path", (event, workspaceDir: string) => {
      log.info("工作目录:", workspaceDir);
      const win = BrowserWindow.fromWebContents(event.sender);
      if (this.workspace) {
        ipcMain.emit(
          "watcher-unwatch-dir",
          null,
          win,
          this.workspace.getWorkspaceDir()
        );
      }
      ipcMain.emit("watcher-watch-dir", null, win, workspaceDir);
      if (win) {
        this.workspace = new Workspace(win, workspaceDir);
      }
    });
  }
  listenForIpcRenderer() {
    ipcMain.handle("ask-for-open-directory", async (evnet) => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ["openDirectory"],
          title: "选择文件夹",
          buttonLabel: "选择此文件夹",
        });
        if (!result.canceled) {
          const path = result.filePaths[0];
          log.info("选择的文件夹路径:", path);
          ipcMain.emit("set-work-path", evnet, path);
          this.preference.set("lastOpenFolder", path);
          return path;
        }
      } catch (error) {
        console.error("Error opening directory dialog:", error);
        return null;
      }
    });

    ipcMain.handle("ask-for-read-file", async (_, filePath: string) => {
      try {
        const extension = path.extname(filePath).toLowerCase();
        if (IMAGE_TYPE.includes(extension)) {
          const buffer = await fs.readFile(filePath);
          return buffer.toString("base64");
        } else if (TEXT_TYPE.includes(extension)) {
          const buffer = await fs.readFile(filePath);
          return buffer.toString("utf-8");
        } else {
          const buffer = await fs.readFile(filePath);
          return new Uint8Array(buffer);
        }
      } catch (error) {
        console.error("Error reading file:", error);
        throw error;
      }
    });

    ipcMain.on(
      "ask-for-create-directory",
      async (_, parentPath: string, dirname: string) => {
        const uniqueName=getUniquenName(parentPath,dirname);
        const dirPath = path.join(parentPath, uniqueName);
        const stat= await fs.stat(dirPath).catch(()=>false);
        if(stat){
          log.warn("Directory already exists:", dirPath);
          return;
        }
        try {
          await fs.mkdir(dirPath, { recursive: true });
          log.info("Create new file",dirPath)
        } catch (error) {
          log.error("Error creating directory:", error);
        }
      }
    );
    ipcMain.on(
      "ask-for-create-file",
      async (_, parentPath: string, filename: string) => {
        const uniqueName=getUniquenName(parentPath,filename);
        const filePath = path.join(parentPath, uniqueName);
        const stat= await fs.stat(filePath).catch(()=>false);
        if(stat){
          log.warn("File already exists:", filePath);
          return;
        }
        try {
          await fs.writeFile(filePath, "");
          log.info("Create new file",filePath)
        } catch (error) {
          log.error("Error create file:", error);
        }
      }
    );
    ipcMain.on("ask-for-unlink", async (_, path: string) => {
      await fs.stat(path).catch((err) => {
        log.warn(err);
        return;
      });
      try {
        const stats = await fs.stat(path);
        if (stats.isFile()) {
          await fs.unlink(path);
        }
        if (stats.isDirectory()) {
          await fs.rm(path, { recursive: true, force: true });
        }
      } catch (error) {
        log.error("Unlink fail:", error);
      }
    });

    ipcMain.on(
      "ask-for-rename",
      async (_, oldPath: string, newName: string) => {
        await fs.stat(oldPath).catch((err) => {
          log.warn(err);
          return;
        });
        try {
          const newPath = path.join(path.dirname(oldPath), newName);
          await fs.rename(oldPath, newPath);
        } catch (error) {
          log.error("rename fail:", error);
        }
      }
    );
    ipcMain.on(
      "ask-for-write-file",
      async (_, filePath: string, content: string | Uint8Array) => {
        await fs.stat(filePath).catch((err) => {
          log.warn(err);
          return;
        });
        try {
          const options = typeof content === "string" ? "utf-8" : null;
          await fs.writeFile(filePath, content, options);
          log.info(`File saved: ${filePath}`);
        } catch (error) {
          log.error("Error writing file:", error);
        }
      }
    );
  }
}

export default App;
