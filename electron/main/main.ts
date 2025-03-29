
import path from "node:path";
import fs from "node:fs/promises";
import App from "./app";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url)
// 导入pdf.js worker
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const pdfWorkerPath = path.join(pdfjsDistPath, "build", "pdf.worker.min.mjs");
fs.cp(pdfWorkerPath, "src/lib/pdfjs-dist/pdf.worker.min.mjs", {
  recursive: true,
});


const app=new App();
app.init();