import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, Badge } from '@/components/ui';
import { Bot, Save } from 'lucide-react';

export const AIProviderSettings: React.FC = () => {
  const [provider, setProvider] = useState('mock');
  const [apiKey, setApiKey] = useState('sk-ant-sample-key-encrypted');
  const [model, setModel] = useState('claude-3-7-sonnet');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-[var(--border-default)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[var(--brand-accent)]" />
          <CardTitle className="text-sm font-semibold">AI Modernization Provider</CardTitle>
        </div>
        <Badge variant={provider === 'mock' ? 'neutral' : 'success'}>
          {provider === 'mock' ? 'Hermetic Offline' : 'Connected'}
        </Badge>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Provider</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select LLM Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic (Claude 3.5 / 3.7)</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="gemini">Google Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="mock">Hermetic Mock (Local Offline)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-primary)]">Model Target</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. claude-3-7-sonnet"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-primary)]">Encrypted API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Stored via Fernet symmetric encryption"
            />
            <p className="text-[11px] text-[var(--text-muted)]">Keys are stored encrypted with AES/Fernet and never passed to Docker sandbox containers.</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={<Save className="h-3.5 w-3.5" />}>
              {saved ? 'Saved!' : 'Save AI Credentials'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
