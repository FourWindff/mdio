// import { ReactNode, useCallback, useEffect, useState } from "react";
// import { ActivityTypes, Tab } from "./AppStateContext";

// const getStoredTabs = window.electron.store.get("openTabs");
// const getStoredActiveTab = window.electron.store.get("activeTab");

// const isEqualTab = (tab1: Tab, tab2: Tab) => {
//   return tab1.file.path === tab2.file.path;
// };
// const existsTab = (tabs: Tab[], tab: Tab) => {
//   return tabs.some((t) => isEqualTab(t, tab));
// };

// export function AppStateProvider({ children }: { children: ReactNode }) {
//   const [tabs, setTabs] = useState<Tab[]>([]);
//   const [activeTab, setActiveTab] = useState<Tab | null>(null);
//   const [activity, setActivity] = useState<ActivityTypes>(undefined);

//   const handleSetTabs = useCallback((tabs: Tab[]) => {
//     setTabs(tabs);
//     window.electron.store.set("Tabs", tabs);
//   }, []);
//   const handleSetActiveTab = useCallback((tab: Tab | null) => {
//     setActiveTab(tab);
//     window.electron.store.set("activeTab", tab);
//   }, []);

//   useEffect(() => {
//     getStoredTabs.then((storedTabs) => {
//       if (storedTabs) {
//         setTabs(storedTabs as Tab[]);
//       }
//     });
//     getStoredActiveTab.then((storedActiveTab) => {
//       if (storedActiveTab) {
//         setActiveTab(storedActiveTab as Tab);
//       }
//     });
//   }, []);

//   const addTab = useCallback(
//     (tab: Tab) => {
//       if (existsTab(tabs, tab)) {
//         if (activeTab && !isEqualTab(activeTab, tab)) {
//           handleSetActiveTab(tab);
//         }
//       } else {
//         handleSetTabs([...tabs, tab]);
//         handleSetActiveTab(tab);
//       }
//     },
//     [tabs]
//   );
//   const switchTab = useCallback((tab: Tab) => {
//     handleSetActiveTab(tab);
//   }, []);
//   const handleCloseTab = useCallback(
//     (tab: Tab) => {
//       const newTabs = tabs.filter((t) => !isEqualTab(t, tab));
//       handleSetTabs(newTabs);
//       if (newTabs.length === 0) {
//         handleSetActiveTab(null);
//         return;
//       } else {
//         const newActiveTab = newTabs[newTabs.length - 1];
//         handleSetActiveTab(newActiveTab);
//       }
//     },
//     [tabs]
//   );
//   //侧边栏文件操作


// }
