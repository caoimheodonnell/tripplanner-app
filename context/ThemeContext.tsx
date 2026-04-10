import { darkColours, lightColours } from '@/constants/colours';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

type ColourSet = typeof lightColours;

type ThemeContextType = {
  isDark: boolean;
  colours: ColourSet;
  toggleTheme: () => void;
};

// theme context - light or dark mode
const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colours: lightColours,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // load saved theme from storage
    AsyncStorage.getItem('darkMode').then(val => {
      if (val === 'true') setIsDark(true);
    });
  }, []);

  function toggleTheme() {
     // switch theme and save preference
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('darkMode', String(next));
  }

  return (
    // share theme with the whole app
    <ThemeContext.Provider value={{ isDark, colours: isDark ? darkColours : lightColours, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}