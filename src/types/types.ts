export interface FileItem {
  basename: string;
  name:string;
  extension: string;
  path:string
  isFile: boolean;
  isDirectory: boolean;
  createTime?: number;
  lastModifiedTime?: number;
  files:FileItem[];
  folders:FileItem[];
}
export interface Tab extends FileItem {
  index?: number;
}

