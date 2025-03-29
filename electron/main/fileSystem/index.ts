
import * as path from "node:path";


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



export function getFilenameWithoutExt(filePath: string): string {
  const basename = path.basename(filePath);
  const extension = path.extname(basename);
  return basename.slice(0, basename.length - extension.length);
}
