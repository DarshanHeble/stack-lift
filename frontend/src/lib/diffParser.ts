/**
 * Utility to parse standard unified git diffs into original (before) and modified (after) file contents.
 */
export interface ParsedDiff {
  originalText: string;
  modifiedText: string;
}

export function parseUnifiedDiff(diff: string): ParsedDiff {
  const lines = diff.split('\n');
  const originalLines: string[] = [];
  const modifiedLines: string[] = [];

  for (const line of lines) {
    // Skip file header lines
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@') || line.startsWith('diff --git')) {
      continue;
    }

    if (line.startsWith('+')) {
      // Added line in modified version
      modifiedLines.push(line.slice(1));
    } else if (line.startsWith('-')) {
      // Removed line from original version
      originalLines.push(line.slice(1));
    } else {
      // Context line present in both
      const content = line.startsWith(' ') ? line.slice(1) : line;
      originalLines.push(content);
      modifiedLines.push(content);
    }
  }

  return {
    originalText: originalLines.join('\n'),
    modifiedText: modifiedLines.join('\n'),
  };
}

/**
 * Detect language mode for Monaco based on file extension.
 */
export function getLanguageForFile(filePath?: string): string {
  if (!filePath) return 'java';
  if (filePath.endsWith('.xml') || filePath.endsWith('.pom')) return 'xml';
  if (filePath.endsWith('.java')) return 'java';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.properties')) return 'ini';
  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
  if (filePath.endsWith('.gradle') || filePath.endsWith('.groovy')) return 'groovy';
  return 'plaintext';
}
