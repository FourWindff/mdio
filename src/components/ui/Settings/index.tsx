import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  // 主题选项
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  // 代理设置
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(false);
  const [proxyUrl, setProxyUrl] = useState<string>('');
  const [proxyPort, setProxyPort] = useState<string>('');
  const [proxyUsername, setProxyUsername] = useState<string>('');
  const [proxyPassword, setProxyPassword] = useState<string>('');

  // 加载设置
  useEffect(() => {
    // 从Electron存储中加载设置
    window.electron.store.get('settings.theme', 'system').then((savedTheme) => {
      setTheme(savedTheme as 'light' | 'dark' | 'system');
    });

    window.electron.store.get('settings.proxy.enabled', false).then((enabled) => {
      setProxyEnabled(enabled as boolean);
    });

    // 其他设置加载...
    window.electron.store.get('settings.proxy.url', '').then((url) => {
      setProxyUrl(url as string);
    });

    window.electron.store.get('settings.proxy.port', '').then((port) => {
      setProxyPort(port as string);
    });

    window.electron.store.get('settings.proxy.username', '').then((username) => {
      setProxyUsername(username as string);
    });

    window.electron.store.get('settings.proxy.password', '').then((password) => {
      setProxyPassword(password as string);
    });
  }, []);

  // 保存设置 & 应用主题函数...
  const saveSettings = () => {
    // 保存主题设置
    window.electron.store.set('settings.theme', theme);
    
    // 保存代理设置
    window.electron.store.set('settings.proxy.enabled', proxyEnabled);
    window.electron.store.set('settings.proxy.url', proxyUrl);
    window.electron.store.set('settings.proxy.port', proxyPort);
    window.electron.store.set('settings.proxy.username', proxyUsername);
    window.electron.store.set('settings.proxy.password', proxyPassword);

    // 应用主题
    applyTheme(theme);
    
    // 应用代理设置
    if (proxyEnabled) {
      window.ipcRenderer.send('set-proxy', {
        url: proxyUrl,
        port: proxyPort,
        username: proxyUsername,
        password: proxyPassword
      });
    } else {
      window.ipcRenderer.send('clear-proxy');
    }

    onClose();
  };

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    if (selectedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', selectedTheme);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h2>设置</h2>
        <button className={styles.closeButton} onClick={onClose}>
          <i className="icon close" />
        </button>
      </div>
      
      <div className={styles.settingsContent}>
        <div className={styles.settingsSection}>
          <h3>外观</h3>
          <div className={styles.settingItem}>
            <label>主题</label>
            <div className={styles.themeOptions}>
              <div 
                className={`${styles.themeOption} ${theme === 'light' ? styles.selected : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className={`${styles.themePreview} ${styles.light}`}></div>
                <span>浅色</span>
              </div>
              <div 
                className={`${styles.themeOption} ${theme === 'dark' ? styles.selected : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className={`${styles.themePreview} ${styles.dark}`}></div>
                <span>深色</span>
              </div>
              <div 
                className={`${styles.themeOption} ${theme === 'system' ? styles.selected : ''}`}
                onClick={() => setTheme('system')}
              >
                <div className={`${styles.themePreview} ${styles.system}`}></div>
                <span>跟随系统</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h3>网络</h3>
          <div className={styles.settingItem}>
            <div className={styles.settingRow}>
              <label htmlFor="proxy-enabled">启用代理</label>
              <input
                id="proxy-enabled"
                type="checkbox"
                checked={proxyEnabled}
                onChange={(e) => setProxyEnabled(e.target.checked)}
              />
            </div>
          </div>

          {proxyEnabled && (
            <div className={styles.proxySettings}>
              <div className={styles.settingItem}>
                <label htmlFor="proxy-url">代理服务器</label>
                <input
                  id="proxy-url"
                  type="text"
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  placeholder="例如: http://proxy.example.com"
                />
              </div>
              
              <div className={styles.settingItem}>
                <label htmlFor="proxy-port">端口</label>
                <input
                  id="proxy-port"
                  type="text"
                  value={proxyPort}
                  onChange={(e) => setProxyPort(e.target.value)}
                  placeholder="例如: 8080"
                />
              </div>
              
              <div className={styles.settingItem}>
                <label htmlFor="proxy-username">用户名 (可选)</label>
                <input
                  id="proxy-username"
                  type="text"
                  value={proxyUsername}
                  onChange={(e) => setProxyUsername(e.target.value)}
                />
              </div>
              
              <div className={styles.settingItem}>
                <label htmlFor="proxy-password">密码 (可选)</label>
                <input
                  id="proxy-password"
                  type="password"
                  value={proxyPassword}
                  onChange={(e) => setProxyPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.settingsFooter}>
        <button className={styles.cancelButton} onClick={onClose}>取消</button>
        <button className={styles.saveButton} onClick={saveSettings}>保存</button>
      </div>
    </div>
  );
};