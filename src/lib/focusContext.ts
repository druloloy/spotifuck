import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

interface FocusContextValue {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

export const FocusContext = createContext<FocusContextValue>({
  isFocusMode: false,
  toggleFocusMode: () => {},
});

export function useFocusMode() {
  return useContext(FocusContext);
}
