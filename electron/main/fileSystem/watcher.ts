import { BrowserWindow, ipcMain } from "electron";
import { getUniqueId } from "../util";
import chokidar from "chokidar";

import { isOsx } from "../config";
import { hasLexicalExtension } from "../../common/filesystem/paths";
import { Preference } from "../preference";

interface ChangeEvent {
  windowId: number;
  pathnames: string;
  duration: number;
  start: number;
}
type WatchType = "dir" | "file";

export const WATCHER_STABILITY_THRESHOLD = 1000;
export const WATCHER_STABILITY_POLL_INTERVAL = 150;
const EVENT_NAME = {
  dir: "WATCHER_DIR_EVENT",
  file: "WATCHER_FILE_EVENT",
};
const add = async (win: BrowserWindow, pathname: string, type: WatchType) => {
  ipcMain.emit(EVENT_NAME[type], null, { event: "add", pathname, win });
};
const unlink = (win: BrowserWindow, pathname: string, type: WatchType) => {
  ipcMain.emit(EVENT_NAME[type], null, { event: "unlink", pathname, win });
};
const change = (win: BrowserWindow, pathname: string, type: WatchType) => {
  if (type === "dir") return;
  win.webContents.send(EVENT_NAME[type], null, {
    event: "change",
    pathname,
    win,
  });
};
const addDir = (win: BrowserWindow, pathname: string, type: WatchType) => {
  if (type === "file") return;
  ipcMain.emit(EVENT_NAME[type], null, { event: "addDir", pathname, win });
};
const unlinkDir = (win: BrowserWindow, pathname: string, type: WatchType) => {
  if (type === "dir") return;
  ipcMain.emit(EVENT_NAME[type], null, { event: "unlinkDir", pathname, win });
};
export class Watcher {
  private _preference: Preference;
  private _ignoreChangeEvents: ChangeEvent[];
  private _watchers: {};

  constructor(preference: Preference) {
    this._preference = preference;
    this._ignoreChangeEvents = [];
    this._watchers = {};
  }

  watch(win: BrowserWindow, watchPath: string, type: WatchType) {
    const usePolling = isOsx ? true : this._preference.get("watcherUsePolling");
    const id: string = getUniqueId();
    const watcher = chokidar.watch(watchPath, {
      ignored: (pathname, fileInfo) => {
        if (!fileInfo) {
          return /(?:^|[/\\])(?:\..|node_modules|(?:.+\.asar))/.test(pathname);
        }
        if (/(?:^|[/\\])(?:\..|node_modules|(?:.+\.asar))/.test(pathname)) {
          return true;
        }
        if (fileInfo.isDirectory()) {
          return false;
        }
        return false;
      },
      ignoreInitial: type === "file",
      persistent: true,
      ignorePermissionErrors: true,
      depth: type === "file" ? (isOsx ? 1 : 0) : undefined,
      awaitWriteFinish: {
        stabilityThreshold: WATCHER_STABILITY_THRESHOLD,
        pollInterval: WATCHER_STABILITY_POLL_INTERVAL,
      },
      usePolling,
    });
    let disposed = false;
    let enospcReached = false;
    let renameTimer = null;
    watcher
      .on("add", async (pathname) => {
        if (!(await this._shouldIgnoreChangeEvent(win.id, pathname, type))) {
          add(win,pathname, type);
        }
      })
      .on("change", async (pathname) => {
        if (!(await this._shouldIgnoreChangeEvent(win.id, pathname, type))) {
          change(win, pathname, type);
        }
      })
      .on("unlink", async (pathname) => {
        unlink(win,pathname, type);
      })
      .on("addDir", async (pathname) => {
        addDir(win,pathname, type);
      })
      .on("unlinkDir", async (pathname) => {
        unlinkDir(win,pathname, type);
      })
      // .on('raw', (event, subpath, details) => {
      //   if (global.MARKTEXT_DEBUG_VERBOSE >= 3) {
      //     console.log('watcher: ', event, subpath, details)
      //   }

      //   // Fix atomic rename on Linux (chokidar#591).
      //   // TODO: This should also apply to macOS.
      //   // TODO: Do we need to rewatch when the watched directory was renamed?
      //   if (isLinux && type === 'file' && event === 'rename') {
      //     if (renameTimer) {
      //       clearTimeout(renameTimer)
      //     }
      //     renameTimer = setTimeout(async () => {
      //       renameTimer = null
      //       if (disposed) {
      //         return
      //       }

      //       const fileExists = await exists(watchPath)
      //       if (fileExists) {
      //         // File still exists but we need to rewatch the file because the inode has changed.
      //         watcher.unwatch(watchPath)
      //         watcher.add(watchPath)
      //       }
      //     }, 150)
      //   }
      // })
      .on("error", (error: any) => {
        // Check if too many file descriptors are opened and notify the user about this issue.
        if (error?.code === "ENOSPC") {
          if (!enospcReached) {
            enospcReached = true;
            console.warn(
              "inotify limit reached: Too many file descriptors are opened."
            );

            win.webContents.send("mt::show-notification", {
              title: "inotify limit reached",
              type: "warning",
              message:
                "Cannot watch all files and file changes because too many file descriptors are opened.",
            });
          }
        } else {
          console.error("Error while watching files:", error);
        }
      });

    const closeFn = () => {
      disposed = true;
      if (this._watchers[id]) {
        delete this._watchers[id];
      }
      // if (renameTimer) {
      //   clearTimeout(renameTimer);
      //   renameTimer = null;
      // }
      watcher.close();
    };
    this._watchers[id] = {
      win,
      watcher,
      pathname: watchPath,
      type,
      close: closeFn,
    };
    return closeFn;
  }
  // Remove a single watcher.
  unwatch(win: BrowserWindow, watchPath: string, type: WatchType) {
    for (const id of Object.keys(this._watchers)) {
      const w = this._watchers[id];
      if (w.win === win && w.pathname === watchPath && w.type === type) {
        w.watcher.close();
        delete this._watchers[id];
        break;
      }
    }
  }

  // Remove all watchers from the given window id.
  unwatchByWindowId(windowId: number) {
    const watchers = [];
    const watchIds = [];
    for (const id of Object.keys(this._watchers)) {
      const w = this._watchers[id];
      if (w.win.id === windowId) {
        watchers.push(w.watcher);
        watchIds.push(id);
      }
    }
    if (watchers.length) {
      watchIds.forEach((id) => delete this._watchers[id]);
      watchers.forEach((watcher) => watcher.close());
    }
  }

  close() {
    Object.keys(this._watchers).forEach((id) => this._watchers[id].close());
    this._watchers = {};
    this._ignoreChangeEvents = [];
  }

  ignoreChangeEvents(
    windowId: number,
    pathnames: string,
    duration = WATCHER_STABILITY_THRESHOLD + WATCHER_STABILITY_POLL_INTERVAL * 2
  ) {
    this._ignoreChangeEvents.push({
      windowId,
      pathnames,
      duration,
      start: new Date().getTime(),
    });
  }

  async _shouldIgnoreChangeEvent(
    windowId: number,
    pathnames: string,
    type: WatchType
  ) {
    if (type === "file") {
      const currentTime = new Date().getTime();
      for (let i = 0; i < this._ignoreChangeEvents.length; i++) {
        const event = this._ignoreChangeEvents[i];
        if (event.windowId === windowId && event.pathnames === pathnames) {
          this._ignoreChangeEvents.splice(i, 1);
          --i;
          if (currentTime - event.start < event.duration) {
            return true;
          }
          //处理伦询的情况
        }
      }
    }
    return false;
  }
}
