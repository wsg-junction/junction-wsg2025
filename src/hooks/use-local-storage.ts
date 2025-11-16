import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  });

  return [
    value,
    (newValue: T) => {
      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    },
  ] as const;
}
