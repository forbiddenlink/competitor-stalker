import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('returns initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('initial');
    });

    it('returns stored value from localStorage', () => {
        localStorage.setItem('test-key', JSON.stringify('stored-value'));

        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('stored-value');
    });

    it('updates localStorage when value changes', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
    });

    it('handles objects correctly', () => {
        const initialObj = { name: 'test', count: 0 };
        const { result } = renderHook(() => useLocalStorage('test-obj', initialObj));

        expect(result.current[0]).toEqual(initialObj);

        const newObj = { name: 'updated', count: 5 };
        act(() => {
            result.current[1](newObj);
        });

        expect(result.current[0]).toEqual(newObj);
        expect(JSON.parse(localStorage.getItem('test-obj') || '{}')).toEqual(newObj);
    });

    it('handles arrays correctly', () => {
        const initialArr = [1, 2, 3];
        const { result } = renderHook(() => useLocalStorage('test-arr', initialArr));

        expect(result.current[0]).toEqual(initialArr);

        const newArr = [4, 5, 6];
        act(() => {
            result.current[1](newArr);
        });

        expect(result.current[0]).toEqual(newArr);
    });

    it('returns initial value when localStorage has invalid JSON', () => {
        localStorage.setItem('bad-json', 'not-valid-json{');

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = renderHook(() => useLocalStorage('bad-json', 'fallback'));

        expect(result.current[0]).toBe('fallback');
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('uses different keys independently', () => {
        const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
        const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

        expect(result1.current[0]).toBe('value1');
        expect(result2.current[0]).toBe('value2');

        act(() => {
            result1.current[1]('updated1');
        });

        expect(result1.current[0]).toBe('updated1');
        expect(result2.current[0]).toBe('value2');
    });

    it('handles boolean values', () => {
        const { result } = renderHook(() => useLocalStorage('bool-key', false));

        expect(result.current[0]).toBe(false);

        act(() => {
            result.current[1](true);
        });

        expect(result.current[0]).toBe(true);
    });

    it('handles null values', () => {
        const { result } = renderHook(() => useLocalStorage<string | null>('null-key', null));

        expect(result.current[0]).toBe(null);

        act(() => {
            result.current[1]('not-null');
        });

        expect(result.current[0]).toBe('not-null');
    });
});

it('keeps unsaved changes available and exposes write failure for recovery', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); });
    const { result } = renderHook(() => useLocalStorage('quota-test', 'old'));
    act(() => result.current[1]('recoverable draft'));
    expect(result.current[0]).toBe('recoverable draft');
    expect(result.current[2]).toMatch(/not saved/i);
    write.mockRestore(); warn.mockRestore();
    act(() => result.current[1]('retry'));
    expect(localStorage.getItem('quota-test')).toBe('"retry"');
    expect(result.current[2]).toBeNull();
});

it('preserves unread original bytes during ordinary edits until explicit replacement', () => {
    const original = '[{"valid":true},{"invalid":true}]';
    localStorage.setItem('unread', original);
    const { result } = renderHook(() => useLocalStorage<string[]>('unread', [], value => Array.isArray(value) && value.every(item => typeof item === 'string') ? value : null));
    act(() => result.current[1](['draft']));
    expect(localStorage.getItem('unread')).toBe(original);
    expect(result.current[2]).toMatch(/could not be read/i);
    expect(result.current[4]).toBe(original);
    act(() => result.current[3](['explicit replacement']));
    expect(localStorage.getItem('unread')).toBe('["explicit replacement"]');
    expect(result.current[2]).toBeNull();
    expect(result.current[4]).toBeNull();
});
