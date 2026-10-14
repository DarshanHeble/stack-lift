import React, { useMemo, useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { parseUnifiedDiff, getLanguageForFile } from '@/lib/diffParser';
import { useUIStore } from '@/store';
import { Columns, AlignJustify } from 'lucide-react';

interface DiffViewerProps {
  diffContent: string;
  changedFiles: string[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffContent, changedFiles }) => {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  const activeFile = changedFiles[selectedFileIndex] || changedFiles[0] || 'pom.xml';
  const language = useMemo(() => getLanguageForFile(activeFile), [activeFile]);
  const { originalText, modifiedText } = useMemo(
    () => parseUnifiedDiff(diffContent),
    [diffContent]
  );

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full border-[var(--border-default)] bg-[var(--surface-canvas)]">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-[var(--border-default)] bg-[var(--surface-card)]">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xs font-mono text-[var(--text-primary)]">
            Monaco Diff Review
          </CardTitle>
          <Badge variant="purple">{changedFiles.length} file(s) modified</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* File selector tabs */}
          <div className="flex items-center gap-1">
            {changedFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIndex(idx)}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  selectedFileIndex === idx
                    ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] font-semibold'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {file}
              </button>
            ))}
          </div>

          {/* Toggle Side-by-Side vs Inline */}
          <Button
            variant="ghost"
            size="sm"
            icon={renderSideBySide ? <Columns className="h-3.5 w-3.5" /> : <AlignJustify className="h-3.5 w-3.5" />}
            onClick={() => setRenderSideBySide(!renderSideBySide)}
            title={renderSideBySide ? 'Switch to Inline Diff' : 'Switch to Side-by-Side Diff'}
          >
            {renderSideBySide ? 'Split' : 'Unified'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-[460px]">
        <DiffEditor
          height="460px"
          language={language}
          original={originalText}
          modified={modifiedText}
          theme={isDarkMode ? 'vs-dark' : 'vs'}
          options={{
            readOnly: true,
            renderSideBySide,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            renderIndicators: true,
            enableSplitViewResizing: true,
            automaticLayout: true,
          }}
        />
      </CardContent>
    </Card>
  );
};
