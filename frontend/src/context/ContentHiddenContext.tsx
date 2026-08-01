import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface ContentHiddenContextType {
  isContentHidden: boolean;
  toggleContentHidden: () => void;
}

const ContentHiddenContext = createContext<ContentHiddenContextType | undefined>(undefined);

export const ContentHiddenProvider = ({ children }: { children: ReactNode }) => {
  const [isContentHidden, setIsContentHidden] = useState(() => 
    localStorage.getItem('isContentHidden') === 'true'
  );

  const checkHiddenState = useCallback(() => {
    setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
  }, []);

  useEffect(() => {
    window.addEventListener('storage-local-change', checkHiddenState);
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, [checkHiddenState]);

  const toggleContentHidden = useCallback(() => {
    const newValue = !isContentHidden;
    setIsContentHidden(newValue);
    localStorage.setItem('isContentHidden', String(newValue));
    window.dispatchEvent(new CustomEvent('storage-local-change'));
  }, [isContentHidden]);

  return (
    <ContentHiddenContext.Provider value={{ isContentHidden, toggleContentHidden }}>
      {children}
    </ContentHiddenContext.Provider>
  );
};

export const useContentHidden = () => {
  const context = useContext(ContentHiddenContext);
  if (context === undefined) {
    throw new Error('useContentHidden must be used within a ContentHiddenProvider');
  }
  return context;
};
