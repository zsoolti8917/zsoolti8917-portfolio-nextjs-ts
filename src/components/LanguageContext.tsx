import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LanguageContextType {
  languageChangeCount: number;
  incrementLanguageChangeCount: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  languageChangeCount: 0,
  incrementLanguageChangeCount: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
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