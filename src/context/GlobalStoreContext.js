// context/GlobalStoreContext.js
'use client'; // Ensure this file is treated as a client component

import React, { createContext, useState, useContext } from 'react';

const GlobalStoreContext = createContext();

export const GlobalStoreProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({});

  const updateState = (newState) => {
    setGlobalState((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <GlobalStoreContext.Provider value={{ globalState, updateState }}>
      {children}
    </GlobalStoreContext.Provider>
  );
};

export const useGlobalStore = () => useContext(GlobalStoreContext);
