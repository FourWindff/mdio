import { Stats } from "node:fs";
import { FileItem } from "@/types/types";

interface ElectronStore {
  get: (key: string, defaultValue?: unknown) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  clear: () => Promise<void>;
}

export interface ElectronAPI {
  // 目录操作
  createDirectory: (
    dirPath: string,
    folderName: string
  ) => Promise<FileItem | null>;
  openDirectory: () => Promise<string | null>;
  readDirectory: (path: string) => Promise<FileItem[]>;
  renameDirectory: (
    oldPath: string, 
    newName: string
  ) => Promise<string | null>;
  deleteDirectory: (dirPath: string) => Promise<string | undefined>;
  
  // 文件操作
  createFile: (
    dirPath: string, 
    fileName: string
  ) => Promise<FileItem | null>;
  readFile: (path: string) => Promise<string | Uint8Array>;
  writeFile: (
    filePath: string, 
    content: string | Uint8Array
  ) => Promise<string | undefined>;
  deleteFile: (path: string) => Promise<string | undefined>;
  renameFile: (
    oldPath: string, 
    newName: string
  ) => Promise<string | null>;
  
  // 存储操作
  store: ElectronStore;

  // 文件监听相关方法
  watchDirectory: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>;
  unwatchDirectory: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>;
  expandDirectoryWatch: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>;

  // 文件变化事件监听
  onFileCreated: (callback: (data: FileItem) => void) => () => void;
  onFileChanged: (callback: (data: FileItem) => void) => () => void;
  onFileDeleted: (callback: (data: { path: string }) => void) => () => void;
  onDirectoryCreated: (callback: (data: FileItem) => void) => () => void;
  onDirectoryDeleted: (callback: (data: { path: string }) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => void;
      off: (channel: string, ...args: any[]) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<any>;
    };
  }
}
