import styles from './styles.module.css';

export const Welcome = () => {
  return (
    <div className={styles.welcome}>
      <div className={styles.content}>
        <h1>欢迎使用 Rich Text Editor</h1>
        <p>请从左侧文件浏览器打开文件夹开始</p>
      </div>
    </div>
  );
};