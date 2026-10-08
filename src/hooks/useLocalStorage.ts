import { useCallback, useRef, useState } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;
const READ_ERROR = 'Saved data could not be read. Original browser storage is protected. Download original storage in Settings before importing, clearing or resetting.';

export function useLocalStorage<T>(key: string, initialValue: T, normalize?: (value: unknown) => T | null): [T, SetValue<T>, string | null, SetValue<T>, string | null] {
    const [stored, setStored] = useState<{ value: T; error: string | null; unread: boolean; raw: string | null }>(() => {
        let raw: string | null = null;
        try {
            raw = typeof window === 'undefined' ? null : window.localStorage.getItem(key);
            const parsed: unknown = raw !== null ? JSON.parse(raw) : initialValue;
            const value = raw !== null && normalize ? normalize(parsed) : parsed as T;
            if (value === null && normalize) throw new Error('Invalid stored data');
            return { value: value as T, error: null, unread: false, raw: null };
        } catch {
            console.warn(`Error reading localStorage key "${key}"`);
            return { value: initialValue, error: READ_ERROR, unread: true, raw };
        }
    });
    const latest = useRef(stored);

    // Resolve once at the call boundary, so batched updates see the latest value
    // and React StrictMode cannot repeat storage or snapshot side effects.
    const write = useCallback((value: T | ((prev: T) => T), replaceUnread: boolean) => {
        const previous = latest.current;
        const next = value instanceof Function ? value(previous.value) : value;
        let error: string | null = previous.unread ? READ_ERROR : null;
        let unread = previous.unread;
        if (!unread || replaceUnread) {
            try {
                if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(next));
                error = null;
                unread = false;
            } catch {
                console.warn(`Error setting localStorage key "${key}"`);
                error = previous.unread ? READ_ERROR : 'Changes are not saved to browser storage. Export a backup before closing this tab, then retry after freeing storage.';
            }
        }
        latest.current = { value: next, error, unread, raw: unread ? previous.raw : null };
        setStored(latest.current);
    }, [key]);
    const setValue = useCallback<SetValue<T>>(value => write(value, false), [write]);
    const replaceValue = useCallback<SetValue<T>>(value => write(value, true), [write]);

    return [stored.value, setValue, stored.error, replaceValue, stored.raw];
}
