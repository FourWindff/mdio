import path from "path";
import { DEFAULT_WORKSPACE, WorkspaceShape } from "../types/workspace";
import Store from "electron-store";
import { BrowserWindow, ipcMain } from "electron";
import { Tree } from "./tree";
import { FileItem, Tab } from "@/types/types";
import log from "electron-log";
import { isFile } from "../../common/filesystem";
import fs from "fs";
import { getFilenameWithoutExt } from "../fileSystem";
import { act } from "react";
const CONFIG_DIR = ".lexical";
const CONFIG_NAME = "workspace";

export class Workspace {
  private store: Store<WorkspaceShape>;
  private workspaceDir: string;
  private projectTree: Tree;
  private folderCount: number;
  private win: BrowserWindow;

  constructor(win: BrowserWindow, workspaceDir: string) {
    this.workspaceDir = workspaceDir;
    this.projectTree = new Tree(workspaceDir);
    this.folderCount = 0;
    this.win = win;
    this.store = new Store({
      name: CONFIG_NAME,
      cwd: path.join(workspaceDir, CONFIG_DIR),
      clearInvalidConfig: true,
    });
    this.init(win);
    this.listenForIpcMain();
    this.listenForRenderer();
  }
  public init(win: BrowserWindow) {
    //检查workspace.json文件的完整性
    for (const k of Object.keys(DEFAULT_WORKSPACE)) {
      const key = k as keyof WorkspaceShape;
      if (!this.has(key)) {
        this.set(key, DEFAULT_WORKSPACE[key]);
      }
    }
    //通知渲染进程渲染,由于不能保证文件树什么时候构建完成,所以需要单独获取activeFile的状态
    const activeFile = this.get("activeFile");
    let activeFileItem: FileItem | null = null;
    if (activeFile && fs.existsSync(activeFile)) {
      const stat = fs.statSync(activeFile);
      activeFileItem = {
        basename: path.basename(activeFile),
        name: getFilenameWithoutExt(activeFile),
        extension: path.extname(activeFile),
        path: activeFile,
        isFile: true,
        isDirectory: false,
        createTime: stat.birthtimeMs,
        lastModifiedTime: stat.mtimeMs,
        files: [],
        folders: [],
      };
    }
    const init = {
      workPath: this.getWorkspaceDir(),
      activeFile: activeFileItem,
      tabs: this.getTabs(),
      expandedFolders: this.getExpandedFolders(),
      isExpandedAll: this.isExpandedAll(),
    };
    log.info("init-workspace", JSON.stringify(init));
    win.webContents.send("init-workspace", init);
  }

  public getWorkspaceDir(): string {
    return this.workspaceDir;
  }

  public setActiveFile(filePath: string): void {
    if (filePath === this.get("activeFile")) return;
    this.addTab(filePath);
    this.set("activeFile", filePath);
  }
  public getActiveFileItem(): FileItem | null {
    const activeFile = this.get("activeFile");
    if (activeFile) {
      return this.projectTree.getFileItemByPath(activeFile);
    }
    return null;
  }

  public getExpandedFolders(): string[] {
    return this.get("expandedFolders");
  }
  public removeExpandIfExist(pathname: string): void {
    const expandedFolders = this.getExpandedFolders();
    const idx = expandedFolders.indexOf(pathname);
    if (idx !== -1) {
      expandedFolders.splice(idx, 1);
      this.set("expandedFolders", expandedFolders);
    }
  }
  public toggleExpand(filePath: string): void {
    //需要动态更新isExpandedAll的状态
    const expandedFolders = this.getExpandedFolders();
    const isExpanded = expandedFolders.includes(filePath);
    if (isExpanded) {
      const idx = expandedFolders.indexOf(filePath);
      expandedFolders.splice(idx, 1);
    } else {
      expandedFolders.push(filePath);
    }
    this.set("expandedFolders", expandedFolders);
  }
  public toggleExpandAll(): void {
    if (this.get("isExpandedAll")) {
      this.set("expandedFolders", []);
      this.set("isExpandedAll", false);
    } else {
      const allPaths = this.projectTree.getAllPath();
      this.set("expandedFolders", allPaths);
      this.set("isExpandedAll", true);
    }
  }
  public isExpandedAll(): boolean {
    log.info(this.getExpandedFolders().length, this.folderCount);
    return this.getExpandedFolders().length === this.folderCount;
  }

  public setActiveTab(tabPath: string): void {
    const exists = this.getTabs().some((t) => t.path === tabPath);
    if (!exists) {
      log.error("tabPath doesn't exist in tabs");
    }
    this.setActiveFile(tabPath);
  }
  private addTab(tabPath: string): void {
    if (tabPath === this.get("activeFile")) return;
    const tabs = this.get("tabs");
    const exists = tabs.some((tab) => tab.path === tabPath);
    if (exists) {
      this.set("activeFile", tabPath);
      return;
    } else {
      const item = this.projectTree.getFileItemByPath(tabPath);
      if (!item) throw new Error("tabPath doesn't exist in projectTree");
      const tab: Tab = {
        ...item,
        index: tabs.length,
      };
      tabs.push(tab);
      this.set("tabs", tabs);
    }
  }
  private closeTab(tabPath: string): void {
    const tabs = this.get("tabs");
    const index = tabs.findIndex((tab) => tab.path === tabPath);
    if (index == -1) {
      throw new Error("tabPath which closed doesn't exist in tabs");
    }
    tabs.splice(index, 1);
    this.set("tabs", tabs);
    if (tabPath === this.get("activeFile")) {
      if (tabs.length == 0) {
        this.set("activeFile", null);
      } else {
        this.set("activeFile", tabs[tabs.length - 1].path);
      }
    }
  }
  private closeTabs(): void {
    const tabs = this.get("tabs");
    this.set("tabs", tabs);
    tabs.splice(0, tabs.length);
  }
  public getTabs(): Tab[] {
    return this.get("tabs");
  }

  private get<K extends keyof WorkspaceShape>(key: K): WorkspaceShape[K] {
    return this.store.get(key);
  }
  private set<K extends keyof WorkspaceShape>(
    key: K,
    value: WorkspaceShape[K]
  ): void {
    this.store.set(key, value);
  }
  private has(kay: string): boolean {
    return this.store.has(kay);
  }

  private listenForIpcMain() {
    ipcMain.on("WATCHER_DIR_EVENT", (e, arg) => {
      const { event, pathname, win } = arg;
      switch (event) {
        case "add": {
          this.projectTree.addFile(pathname);
          break;
        }
        case "unlink": {
          this.projectTree.unlinkFile(pathname);
          if (this.get("tabs").some((t) => t.path === pathname)) {
            this.closeTab(pathname);
          }
          break;
        }
        case "addDir": {
          this.folderCount++;
          this.projectTree.addDir(pathname);
          break;
        }
        case "unlinkDir": {
          this.folderCount--;
          this.projectTree.unlinkDir(pathname);
          this.removeExpandIfExist(pathname);
          break;
        }
        default: {
          throw new Error(`Unknown event: ${event}`);
        }
      }
      const update={
        tree:this.projectTree.getTree(),
        activeFile: this.getActiveFileItem(),
        tabs: this.getTabs(),
        expandedFolders: this.getExpandedFolders(),
        isExpandedAll: this.isExpandedAll(),
      }
      win?.webContents.send("UPDATE_WORKSPACE", update);
    });
  }
  private listenForRenderer() {
    ipcMain.handle("active-file", (_, fielPath: string) => {
      this.setActiveFile(fielPath);
      return structuredClone({
        activeFile: this.getActiveFileItem(),
        tabs: this.getTabs(),
      });
    });
    ipcMain.handle("active-tab", (_, filePath: string) => {
      this.setActiveTab(filePath);
      return structuredClone({
        activeFile: this.getActiveFileItem(),
      });
    });
    ipcMain.handle("close-tab", (_, filePath: string) => {
      this.closeTab(filePath);
      return structuredClone({
        activeFile: this.getActiveFileItem(),
        tabs: this.getTabs(),
      });
    });
    ipcMain.handle("close-all-tabs", (_) => {
      this.closeTabs();
      return structuredClone({
        activeFile: this.getActiveFileItem(),
        tabs: this.getTabs(),
      });
    });
    ipcMain.handle("toggle-expand", (_, filePath: string) => {
      if (isFile(filePath)) throw new Error("filePath should be a directory");
      this.toggleExpand(filePath);
      return {
        expandedFolders: [...this.getExpandedFolders()],
        isExpandedAll: this.isExpandedAll(),
      };
    });
    ipcMain.handle("toggle-expand-all", (_) => {
      this.toggleExpandAll();
      log.info("all?", this.isExpandedAll());
      return {
        expandedFolders: [...this.getExpandedFolders()],
        isExpandedAll: this.isExpandedAll(),
      };
    });
  }
}
