import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';
import { Send, MessageSquare } from 'lucide-react';

interface RevisionFeedbackPanelProps {
  onSubmitFeedback: (feedback: string) => Promise<void>;
  disabled?: boolean;
}

export const RevisionFeedbackPanel: React.FC<RevisionFeedbackPanelProps> = ({
  onSubmitFeedback,
  disabled = false,
}) => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    try {
      setSubmitting(true);
      await onSubmitFeedback(feedback.trim());
      setFeedback('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--brand-accent)]" />
          <CardTitle className="text-xs font-semibold text-[var(--text-primary)]">
            AI Patch Revision Chat
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-3 text-xs text-[var(--text-secondary)]">
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--text-primary)]">StackLift Engine: </span>
            This patch updates Maven compiler configurations and rewrites deprecated syntax. If specific dependencies need pinning, reply below.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Suggest revision (e.g. 'Use Mockito 5.x instead of 4.x')..."
            disabled={disabled || submitting}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Send className="h-3.5 w-3.5" />}
            disabled={disabled || submitting || !feedback.trim()}
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
