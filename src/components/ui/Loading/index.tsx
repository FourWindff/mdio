import styles from './styles.module.css';

export const Loading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <span>加载中...</span>
    </div>
  );
};