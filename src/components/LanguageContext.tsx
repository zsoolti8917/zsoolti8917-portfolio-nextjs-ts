import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext({
  languageChangeCount: 0,
  incrementLanguageChangeCount: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [languageChangeCount, setLanguageChangeCount] = useState(0);

  const incrementLanguageChangeCount = () => {
    setLanguageChangeCount(prev => prev + 1);
  };

  return (
    <LanguageContext.Provider value={{ languageChangeCount, incrementLanguageChangeCount }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);