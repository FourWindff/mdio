import { useState, useEffect, useRef, useCallback } from "react";
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import styles from "./styles.module.css";
import { Loading } from "@/components/ui/Loading";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "@/lib/pdfjs-dist/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  filePath: string;
}

const pdfCache = new Map<string, Blob>();
//TODO 滚动会跳
export const PdfViewer = ({ filePath }: PdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [visibleThumbnails, setVisibleThumbnails] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      const container = contentRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollingDown = e.deltaY > 0;

      if (isScrollingDown && scrollHeight - scrollTop <= clientHeight + 100) {
        setPageNumber((prev) => Math.min(numPages, prev + 1));
      } else if (!isScrollingDown && scrollTop <= 100) {
        setPageNumber((prev) => Math.max(1, prev - 1));
      }
    },
    [numPages]
  );

  const handleThumbnailScroll = useCallback(() => {
    const container = thumbnailsRef.current;
    if (!container) return;

    const { scrollTop, clientHeight } = container;
    const thumbnailHeight = 150 + 10;
    const buffer = 2;

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / thumbnailHeight) - buffer
    );
    const endIndex = Math.min(
      numPages - 1,
      Math.ceil((scrollTop + clientHeight) / thumbnailHeight) + buffer
    );

    const visible = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    );
    setVisibleThumbnails(visible);
  }, [numPages]);

  //加载pdf资源
  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        if (pdfCache.has(filePath)) {
          const cachedBlob = pdfCache.get(filePath)!;
          setPdfBlob(cachedBlob);
        } else {
          const data = (await window.electron.readFile(filePath)) as Uint8Array;
          const blob = new Blob([data], { type: "application/pdf" });
          pdfCache.set(filePath, blob);
          setPdfBlob(blob);
        }
        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();
  }, [filePath]);

  //阅读窗口滚动事件
  useEffect(() => {
    const container = contentRef.current;
    if (container) {
      container.addEventListener("wheel", handleScroll);
      return () => container.removeEventListener("wheel", handleScroll);
    }
  }, [handleScroll]);

  //缩略图滚动事件
  useEffect(() => {
    const container = thumbnailsRef.current;
    if (container) {
      container.addEventListener("scroll", handleThumbnailScroll);
      handleThumbnailScroll();
      return () =>
        container.removeEventListener("scroll", handleThumbnailScroll);
    }
  }, [handleThumbnailScroll]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.toolbar}>
        <div className={styles.navigation}>
          <button
            onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
            disabled={pageNumber <= 1}
          >
            <i className="icon chevron-left" />
          </button>
          <span>
            第 {pageNumber} 页 / 共 {numPages} 页
          </span>
          <button
            onClick={() =>
              setPageNumber((prev) => Math.min(numPages, prev + 1))
            }
            disabled={pageNumber >= numPages}
          >
            <i className="icon chevron-right" />
          </button>
        </div>
        <div className={styles.zoom}>
          <button onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}>
            <i className="icon zoom-out" />
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}>
            <i className="icon zoom-in" />
          </button>
        </div>
        <div className={styles.viewControls}>
          <button
            onClick={() => setShowThumbnails((prev) => !prev)}
            className={showThumbnails ? styles.active : ""}
          >
            <i className="icon thumbnails" />
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {showThumbnails && (
          <div className={styles.thumbnails} ref={thumbnailsRef}>
            {[...Array(numPages)].map((_, index) => (
              <div
                key={index + 1}
                className={`${styles.thumbnail} ${
                  pageNumber === index + 1 ? styles.active : ""
                }`}
                onClick={() => setPageNumber(index + 1)}
                style={{ height: "150px" }}
              >
                {visibleThumbnails.includes(index) ? (
                  <Document file={pdfBlob}>
                    <Page
                      pageNumber={index + 1}
                      scale={0.2}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                ) : (
                  <div className={styles.thumbnailPlaceholder}>
                    <span className={styles.pageNumber}>{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.content} ref={contentRef}>
          {isLoading ? (
            <Loading />
          ) : (
            pdfBlob && (
              <Document file={pdfBlob} onLoadSuccess={onDocumentLoadSuccess}>
                {[pageNumber - 1, pageNumber, pageNumber + 1]
                  .filter((page) => page > 0 && page <= numPages)
                  .map((page) => (
                    <Page
                      key={page}
                      pageNumber={page}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className={styles.page}
                    />
                  ))}
              </Document>
            )
          )}
        </div>
      </div>
    </div>
  );
};
