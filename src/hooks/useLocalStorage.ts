import { useCallback, useState } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
    // Get from local storage then parse stored json or return initialValue
    const readValue = (): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Compute the next value from the *latest* state inside the updater so two
    // synchronous calls in one render can't drop each other's write, and persist
    // it in the same step. (Vite SPA — no SSR — so no post-mount re-read needed.)
    const setValue = useCallback<SetValue<T>>(
        (value) => {
            setStoredValue((prev) => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                try {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    }
                } catch (error) {
                    console.warn(`Error setting localStorage key "${key}":`, error);
                }
                return valueToStore;
            });
        },
        [key]
    );

    return [storedValue, setValue];
}
