import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  currentLang: string;
  setCurrentLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'es',
  setCurrentLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState('es');

  useEffect(() => {
    const storedLang = localStorage.getItem('userLanguage') || 'es';
    setCurrentLang(storedLang);
  }, []);

  const value = {
    currentLang,
    setCurrentLang: (lang: string) => {
      localStorage.setItem('userLanguage', lang);
      setCurrentLang(lang);
    },
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
