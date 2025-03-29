import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

interface ImageViewerProps {
  src: string;
  alt: string;
}

export const ImageViewer = ({ src, alt }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current) {
      const img = imgRef.current;
      if (img.complete) {
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      } else {
        img.onload = () => {
          setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        };
      }
    }
  }, [src]);

  const handleZoomIn = () => setScale(prev => prev + 0.1);
  const handleZoomOut = () => setScale(prev => Math.max(0.1, prev - 0.1));
  const handleReset = () => setScale(1);
  const handleFitScreen = () => {
    if (imgRef.current) {
      const container = imgRef.current.parentElement;
      if (container) {
        const containerRatio = container.clientWidth / container.clientHeight;
        const imageRatio = naturalSize.width / naturalSize.height;
        
        if (containerRatio > imageRatio) {
          setScale(container.clientHeight / naturalSize.height);
        } else {
          setScale(container.clientWidth / naturalSize.width);
        }
      }
    }
  };

  return (
    <div className={styles.imageViewer}>
      <div className={styles.toolbar}>
        <button onClick={handleZoomOut} title="缩小">
          <i className="icon zoom-out" />
        </button>
        <span className={styles.scale}>{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} title="放大">
          <i className="icon zoom-in" />
        </button>
        <button onClick={handleReset} title="实际大小">
          <i className="icon zoom-actual" />
        </button>
        <button onClick={handleFitScreen} title="适应屏幕">
          <i className="icon zoom-full" />
        </button>
      </div>
      <div className={styles.imageContainer}>
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
          }}
        />
      </div>
    </div>
  );
};