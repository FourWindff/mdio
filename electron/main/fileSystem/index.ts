import { FileItem } from "@/types/types";

import { ipcMain } from "electron";
import * as path from "node:path";
import * as fs from "node:fs/promises";


export const READ_DIRECTORY = "read_directory";
export const CREATE_DIRECTORY = "create_directory";
export const UNLINK_DIRECTORY = "unlink_directory";
export const OPEN_DIRECTORY = "open_directory";
export const RENAME_DIRECTORY = "rename_directory";

export const READ_FILE = "read_file";
export const WRITE_FILE = "write_file";
export const CREATE_FILE = "create_file";
export const UNLINK_FILE = "unlink_file";
export const RENAME_FILE = "rename_file";

export const GET_STORE = "get_store";
export const SET_STORE = "set_store";
export const CLEAR_STORE = "clear_store";

export const PROJETTREE_UPDATE="projecttree_update"

ipcMain.handle(READ_DIRECTORY, async (_, dirPath: string) => {
  try {
    const getChild = async (dirPath: string): Promise<FileItem[]> => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const filePromises = items
        .filter((item) => {
          if (item.isDirectory()) {
            return true;
          }
          const extension = path.extname(item.name).toLowerCase();
          return LEGAL_TYPE.includes(extension);
        })
        .map(async (item) => {
          const filePath = path.join(dirPath, item.name);
          const children = item.isDirectory()
            ? await getChild(filePath)
            : undefined;
          return {
            basename: path.basename(filePath),
            name: getFilenameWithoutExt(filePath),
            extension: path.extname(filePath).toLowerCase(),
            path: filePath,
            isFile: item.isFile(),
            isDirectory: item.isDirectory(),
            children,
          };
        });
      return Promise.all(filePromises);
    };
    return getChild(dirPath);
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
});
ipcMain.handle(
  CREATE_DIRECTORY,
  async (_, dirPath: string, folderName: string) => {
    try {
      const folderPath = path.join(dirPath, folderName);
      await fs.mkdir(folderPath);
      const stat = await fs.stat(folderPath);
      const folderItem: FileItem = {
        basename: path.basename(folderName),
        name: getFilenameWithoutExt(folderPath),
        extension: path.extname(folderName).toLowerCase(),
        path: folderPath,
        isFile: false,
        isDirectory: true,
        createTime: stat.birthtimeMs,
        lastModifiedTime: stat.mtimeMs,
      };
      return folderItem;
    } catch (error) {
      console.error("Error create directory:", error);
      return null;
    }
  }
);
ipcMain.handle(UNLINK_DIRECTORY, async (_, dirPath: string) => {
  try {
    const stats = await fs.stat(dirPath);
    if (stats.isDirectory()) {
      await fs.rm(dirPath, { recursive: true, force: true });
      return dirPath;
    }
  } catch (error) {
    console.error("删除文件夹失败:", error);
  }
});
ipcMain.handle(
  RENAME_DIRECTORY,
  async (_, oldPath: string, newName: string) => {
    try {
      const newPath = path.join(path.dirname(oldPath), newName);
      await fs.rename(oldPath, newPath);
      return newPath;
    } catch (error) {
      console.error("重命名失败:", error);
      return null;
    }
  }
);


ipcMain.handle(CREATE_FILE, async (_, { dirPath, fileName }) => {
  try {
    const filePath = path.join(dirPath, fileName);
    await fs.writeFile(filePath, "");
    const stat = await fs.stat(filePath);
    const fileItem: FileItem = {
      basename: path.basename(fileName),
      name: getFilenameWithoutExt(fileName),
      extension: path.extname(fileName).toLowerCase(),
      path: filePath,
      isFile: true,
      isDirectory: false,
      createTime: stat.birthtimeMs,
      lastModifiedTime: stat.mtimeMs,
    };
    return fileItem;
  } catch (error) {
    console.error("创建文件失败:", error);
    return null;
  }
});
ipcMain.handle(
  WRITE_FILE,
  async (_, filePath: string, content: string | Uint8Array) => {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      const options = typeof content === "string" ? "utf-8" : null;
      await fs.writeFile(filePath, content, options);
      console.log(`${Date.now().toString()} - File saved: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("Error writing file:", error);
    }
  }
);
ipcMain.handle(RENAME_FILE, async (_, oldPath: string, newName: string) => {
  try {
    const newPath = path.join(path.dirname(oldPath), newName);
    await fs.rename(oldPath, newPath);
    return newPath;
  } catch (error) {
    console.error("重命名失败:", error);
    return null;
  }
});
ipcMain.handle(UNLINK_FILE, async (_, filePath: string) => {
  try {
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      await fs.unlink(filePath);
      return filePath;
    }
  } catch (error) {
    console.error("删除文件失败:", error);
  }
});



export function getFilenameWithoutExt(filePath: string): string {
  const basename = path.basename(filePath);
  const extension = path.extname(basename);
  return basename.slice(0, basename.length - extension.length);
}
