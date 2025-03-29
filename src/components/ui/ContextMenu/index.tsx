import React, { useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

export type point = { x: number; y: number };

interface ContextMenuProps {
  event: React.MouseEvent;
  onClose: () => void;
  children: ReactNode;
}

interface MenuItemProps {
  iconClassName: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const MenuItem = ({ iconClassName, title, onClick }: MenuItemProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <div className={`${styles.menuItem}`} onClick={handleClick}>
      <i className={`${iconClassName} ${styles.icon}`} />
      <span className={styles.title}>{title}</span>
    </div>
  );
};

export const MenuDivider = () => {
  return <div className={styles.divider} role="separator" />;
};

const ContextMenu = ({ event, onClose, children }: ContextMenuProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    // 给菜单一个小延迟以确保DOM已完全渲染
    const positionTimeout = setTimeout(() => {
      if (!menuRef.current) return;

      const menu = menuRef.current;
      const x = event.clientX;
      const y = event.clientY;

      // 获取菜单尺寸和视口尺寸
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 计算菜单是否会超出视口
      let adjustedX = x;
      let adjustedY = y;

      // 如果菜单右侧超出视口
      if (x + menuRect.width > viewportWidth) {
        adjustedX = Math.max(0, viewportWidth - menuRect.width - 5);
      }

      // 如果菜单底部超出视口
      if (y + menuRect.height > viewportHeight) {
        adjustedY = Math.max(0, viewportHeight - menuRect.height - 5);
      }

      // 更新菜单位置
      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }, 0);

    return () => clearTimeout(positionTimeout);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
      //TODO 测试
      if (document.body && !document.body.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleRightClick = () => {
      onClose();
    };

    const handleScroll = () => {
      onClose();
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutsideClick, true);
      document.addEventListener("contextmenu", handleRightClick, true);
      document.addEventListener("scroll", handleScroll, true);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("contextmenu", handleRightClick, true);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  useEffect(() => {
    const menuItems = menuRef.current?.querySelectorAll(
      `.${styles.menuItem}:not(.${styles.disabled})`
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!menuItems?.length) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => {
            const nextIndex = prev < menuItems.length - 1 ? prev + 1 : 0;
            (menuItems[nextIndex] as HTMLElement).scrollIntoView({
              block: "nearest",
            });
            return nextIndex;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : menuItems.length - 1;
            (menuItems[nextIndex] as HTMLElement).scrollIntoView({
              block: "nearest",
            });
            return nextIndex;
          });
          break;

        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < menuItems.length) {
            (menuItems[activeIndex] as HTMLElement).click();
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, onClose]);

  return createPortal(
    <div className={styles.overlay}>
      <div ref={menuRef} className={styles.contextMenu}>
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) {
            return child;
          }
          
          if (child.type === MenuItem) {
            const typedChild = child as React.ReactElement<MenuItemProps>;
            return React.cloneElement(typedChild, {
              onClick: () => {
                if (typedChild.props.onClick) {
                  typedChild.props.onClick();
                }
                onClose();
              }
            });
          }


          return child;
        })}
      </div>
    </div>,
    document.body
  );
};

export default ContextMenu;
