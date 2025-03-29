

export const newDirectory=(parentPath:string,dirname:string)=>{
    window.ipcRenderer.send("ask-for-create-directory",parentPath,dirname);
}
export const newFile=(parentPath: string, filename: string)=>{
    window.ipcRenderer.send("ask-for-create-file", parentPath, filename);
}
export const remove=(path: string)=>{
    window.ipcRenderer.send("ask-for-unlink",path);
}
export const rename=(oldPath:string,newName:string)=>{
    window.ipcRenderer.send("ask-for-rename",oldPath,newName);
}
