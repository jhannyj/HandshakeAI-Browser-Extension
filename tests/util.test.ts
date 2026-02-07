import { extractTaskId } from '../scripts/util';
import { chrome } from 'jest-chrome';

describe('extractTaskId logic', () => {
    test('extracts digits correctly from a standard multimango URL', () => {
        const url = "https://www.multimango.com/tasks/260126-text-to-image-compare";
        expect(extractTaskId(url)).toBe("260126");
    });

    test('returns null if /tasks/ is missing', () => {
        const url = "https://www.google.com/search?q=260126";
        expect(extractTaskId(url)).toBeNull();
    });

    test('returns null if there are no digits after /tasks/', () => {
        const url = "https://www.multimango.com/tasks/abc-text-to-image";
        expect(extractTaskId(url)).toBeNull();
    });

    test('integration: extracts ID from a mocked chrome tab', () => {
        // Mocking a chrome tab object
        const mockTab: Partial<chrome.tabs.Tab> = {
            url: "https://www.multimango.com/tasks/999888-test-task"
        };

        const result = extractTaskId(mockTab.url!);
        expect(result).toBe("999888");
    });
});