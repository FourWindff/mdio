import { FileItem } from "@/types/types";
import path from "path";
import { getFilenameWithoutExt } from "../fileSystem";
import fs from "fs";
import log from "electron-log/node";

export class Tree {
  private root: FileItem;

  constructor(rootPath: string) {
    const stat = fs.statSync(rootPath);
    if (stat.isFile()) throw new Error("workspaceDir should be a directory");
    this.root = {
      basename: path.basename(rootPath),
      name: getFilenameWithoutExt(rootPath),
      extension: "",
      path: rootPath,
      isFile: false,
      isDirectory: true,
      createTime: stat.birthtimeMs,
      lastModifiedTime: stat.mtimeMs,
      folders: [],
      files: [],
    };
  }
  getAllPath(): string[] {
    const paths: string[] = [];
    const traverse = (item: FileItem) => {
      paths.push(item.path);
      item.folders.forEach(traverse);
    };
    traverse(this.root);
    return paths;
  }
  addFile(pathname: string) {
    log.info("tree-addFile:", pathname);
    const dirname = path.dirname(pathname);
    const name = getFilenameWithoutExt(pathname);
    const stat = fs.statSync(pathname);
    const subDirectories = this.getSubdirectoriesFromRoot(dirname);
    let currentPath = this.root.path;
    let currentFolder = this.root;
    let currentSubFolders = this.root.folders;
    //确保新文件的父目录存在
    for (const directoryName of subDirectories) {
      let childFolder = currentSubFolders.find((f) => f.name === directoryName);
      if (!childFolder) {
        childFolder = {
          basename: directoryName,
          name: directoryName,
          extension: "",
          path: path.join(currentPath, directoryName),
          isFile: false,
          isDirectory: true,
          createTime: stat.birthtimeMs,
          lastModifiedTime: stat.mtimeMs,
          files: [],
          folders: [],
        };
        currentSubFolders.push(childFolder);
      }

      currentPath = path.join(currentPath, directoryName);
      currentFolder = childFolder;
      currentSubFolders = childFolder.folders;
    }
    if (!currentFolder.files.find((f) => f.name === name)) {
      //TODO 需要根据排序方式来改变
      const newItem: FileItem = {
        basename: path.basename(pathname),
        name: getFilenameWithoutExt(pathname),
        extension: path.extname(pathname).toLowerCase(),
        path: pathname,
        isFile: true,
        isDirectory: false,
        createTime: stat.birthtimeMs,
        lastModifiedTime: stat.mtimeMs,
        files: [],
        folders: [],
      };
      currentFolder.files.push(newItem);
    }
  }
  addDir(dirname: string) {
    log.info("tree-addDir:", dirname);
    const subDirectories = this.getSubdirectoriesFromRoot(dirname);
    const stat = fs.statSync(dirname);
    let currentPath = this.root.path;
    let currentSubFolders = this.root.folders;
    for (const directoryName of subDirectories) {
      let childFolder = currentSubFolders.find((f) => f.name === directoryName);
      if (!childFolder) {
        childFolder = {
          basename: directoryName,
          name: directoryName,
          extension: "",
          path: path.join(currentPath, directoryName),
          isFile: false,
          isDirectory: true,
          createTime: stat.birthtimeMs,
          lastModifiedTime: stat.mtimeMs,
          files: [],
          folders: [],
        };
        currentSubFolders.push(childFolder);
      }

      currentPath = path.join(currentPath, directoryName);
      currentSubFolders = childFolder.folders;
    }
  }
  unlinkFile(filepath: string) {
    const dirname = path.dirname(filepath);
    const subDirectories = this.getSubdirectoriesFromRoot(dirname);

    let currentFolder = this.root;
    let currentSubFolders = this.root.folders;
    for (const directoryName of subDirectories) {
      const childFolder = currentSubFolders.find(
        (f) => f.name === directoryName
      );
      if (!childFolder) return;
      currentFolder = childFolder;
      currentSubFolders = childFolder.folders;
    }

    const index = currentFolder.files.findIndex(
      (f) => f.name === getFilenameWithoutExt(filepath)
    );
    if (index !== -1) {
      currentFolder.files.splice(index, 1);
    }
  }
  unlinkDir(dirpath: string) {
    const subDirectories = this.getSubdirectoriesFromRoot(dirpath);

    subDirectories.pop();
    let currentSubFolders = this.root.folders;
    for (const directoryName of subDirectories) {
      const childFolder = currentSubFolders.find(
        (f) => f.name === directoryName
      );
      if (!childFolder) return;
      currentSubFolders = childFolder.folders;
    }

    const index = currentSubFolders.findIndex(
      (f) => f.name === getFilenameWithoutExt(dirpath)
    );
    if (index !== -1) {
      currentSubFolders.splice(index, 1);
    }
  }
  getSubdirectoriesFromRoot(pathname: string): string[] {
    if (!path.isAbsolute(pathname)) {
      throw new Error("pathname should be absolute");
    }

    const relativePath = path.relative(this.root.path, pathname);
    return relativePath ? relativePath.split(path.sep) : [];
  }
  getFileItemByPath(pathname: string): FileItem | null {
    const dirname = path.dirname(pathname);
    const subDirectories = this.getSubdirectoriesFromRoot(dirname);
    let currentFolder = this.root;
    let currentSubFolders = this.root.folders;
    for (const directoryName of subDirectories) {
      const childFolder = currentSubFolders.find(
        (f) => f.name === directoryName
      );
      if (!childFolder) return null;
      currentFolder = childFolder;
      currentSubFolders = childFolder.folders;
    }
    log.info(currentFolder);
    const fileItem = currentFolder.files.find((f) => {
      log.info("--------",pathname,f.path);
      return  (f.path === pathname)
    });
    return fileItem || null;
  }
  clone(): FileItem {
    //clone all ???
    const clone = (item: FileItem): FileItem => {
      return {
        ...item,
        folders: item.folders.map(clone),
        files: item.files.map(clone),
      };
    };
    return clone(this.root);
  }
}
