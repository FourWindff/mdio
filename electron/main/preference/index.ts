import { nativeTheme } from "electron";
import Store from "electron-store";
import { DEFAULT_PREFERENCES, Preferences } from "../types/preferences";
import log from "electron-log";

const PREFERENCES_NAME = "preferences";


export class Preference {
  private store: Store<Preferences>;
  constructor(preferencesPath: string) {
    this.store = new Store({
      name: PREFERENCES_NAME,
      cwd: preferencesPath,
      clearInvalidConfig: true,
    });
  }
  init() {
    if (Object.keys(this.getAll).length <= 0) {
      const initalPreferences: Preferences = DEFAULT_PREFERENCES;
      try {
        if (nativeTheme.shouldUseDarkColors) {
          initalPreferences.theme = "dark";
        }
      } catch (error) {
        log.error("Error initializing preferences:", error);
      }
      this.store.set(initalPreferences);
    }
  }

  getAll(): Preferences {
    return this.store.store;
  }
  get<K extends keyof Preferences>(
    key: K,
    defaultValue?: Preferences[K]
  ): Preferences[K] {
    return this.store.get(key, defaultValue as any);
  }
  set<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
    this.store.set(key, value);
  }
  reset(): void {
    const defaults: Preferences = DEFAULT_PREFERENCES;

    try {
      if (nativeTheme.shouldUseDarkColors) {
        defaults.theme = "dark";
      }
    } catch (error) {
      log.error("Error detecting system theme:", error);
    }

    this.store.clear();
    this.store.set(defaults);
    log.info("Preferences reset to defaults");
  }
}
