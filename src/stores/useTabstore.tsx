import { create } from 'zustand'
import { v4 as uuid } from 'uuid';

const useTabStore = create((set, get) => ({
  tabs: [{
    id: uuid(),
    fileName: null,
    title: 'Welcome',
    readOnly: true,
    content: `
      ---------------------------------------
      Researcho Editor v${process.env.APP_VERSION}
      ---------------------------------------

      Welcome to the Researcho Editor. A full serverless, offline AI editor that allows
      you to use local open source AI models to generate documents.


    `.split('\n').map(line => line.trim()).join('\n').trim(),
    active: true
  }],

  setTabs: (newTabs) => set({ tabs: newTabs }),

  add: (tab) => set((state) => {
    tab.id = tab.id || uuid();
    const newTabs = [
      ...state.tabs
    ];

    if (tab.active) {
      for (const tab of newTabs) {
        tab.active = false;
      }
    }

    newTabs.push(tab);

    return ({
      tabs: newTabs
    });
  }),

  removeById: (id) => set((state) => {
    const currentActiveIndex = state.tabs.findIndex(tab => tab.active);
    const isRemovingActive = state.tabs[currentActiveIndex].id === id;
    const newTabs = state.tabs.filter(tab => tab.id !== id);

    if (newTabs.length === 0) {
      return { tabs: newTabs };
    }

    if (isRemovingActive) {
      const newActiveIndex = currentActiveIndex > 0 ? currentActiveIndex - 1 : 0;
      newTabs[newActiveIndex].active = true;
    }

    return {
      tabs: newTabs
    };
  }),

  getActive: () => {
    const tabs = get().tabs;
    const activeTabs = tabs.filter((tab) => tab.active);
    return activeTabs[0];
  },

  setActiveById: (id) => set((state) => {
    return {
      tabs: state.tabs.map(tab => ({
        ...tab,
        active: tab.id === id
      }))
    };
  }),

  patchById: (id, changes) => set((state) => {
    const currentTab = state.tabs.find(tab => tab.id === id);

    return {
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...currentTab, ...changes } : tab))
    };
  }),

}))

export default useTabStore;
