"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

interface ViewportContextType {
  viewportSize: ViewportSize;
  setViewportSize: (size: ViewportSize) => void;
}

const ViewportContext = createContext<ViewportContextType | undefined>(undefined);

export function ViewportProvider({ children }: { children: React.ReactNode }) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');

  useEffect(() => {
    const setViewportClass = (size: ViewportSize) => {
      document.body.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
      document.body.classList.add(`viewport-${size}`);

      if (size === 'mobile') {
        document.body.style.width = '375px';
      } else if (size === 'tablet') {
        document.body.style.width = '768px';
      } else {
        document.body.style.width = '100%';
      }

      // Remove the centering styles
      document.body.style.margin = '0';
      document.body.style.borderLeft = 'none';
      document.body.style.borderRight = 'none';
    };

    setViewportClass(viewportSize);
  }, [viewportSize]);

  return (
    <ViewportContext.Provider value={{ viewportSize, setViewportSize }}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const context = useContext(ViewportContext);
  if (context === undefined) {
    throw new Error('useViewport must be used within a ViewportProvider');
  }
  return context;
}