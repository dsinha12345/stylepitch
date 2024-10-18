import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
interface RegionContextType {
  region: string;
  setRegion: (region: string) => void;
}

// Create the context with default values
const RegionContext = createContext<RegionContextType>({
  region: '' , // Default region is 'Global'
  setRegion: () => {},
});

// Create a provider component
export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<string>(''); // Initialize with 'Global'

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
};

// Create a custom hook to use the Region context
export const useRegion = () => {
  return useContext(RegionContext);
};
