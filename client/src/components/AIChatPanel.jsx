import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/api/axios';

// A lightweight chat panel tailored for water-quality Q&A
export default function AIChatPanel({
  title = 'Ask AI (Water Quality Assistant)',
  param = null,
  latestValues = null, // object with keys like pH, tds, ... (predictions[0])
  stationName = null,
  standards = null, // WATER_QUALITY_STANDARDS
}) {
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant'|'system', content }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const currentValue = useMemo(() => {
    if (!param || !latestValues) return undefined;
    return latestValues[param];
  }, [param, latestValues]);

  // Minimal safe markdown renderer: escapes HTML, then applies **bold**, *italic*, `code`, and newlines
  const renderMarkdown = (text) => {
    if (!text) return '';
    const escapeHtml = (s) => s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    let out = escapeHtml(text);
    // code spans first
    out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted/60">$1<\/code>');
    // bold
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1<\/strong>');
    // italic (single *)
    out = out.replace(/\*([^*]+)\*/g, '<em>$1<\/em>');
    // line breaks
    out = out.replace(/\n/g, '<br/>');
    return out;
  };

  // Quick standards shortcuts specified by the user
  const quickStandards = [
    { key: 'pH', label: 'pH: 6.5 – 8.5', ask: '6.5 – 8.5', unit: '' },
    { key: 'turbidity', label: 'Turbidity (NTU): ≤ 10', ask: '≤ 10 NTU', unit: 'NTU' },
    { key: 'tds', label: 'TDS (mg/L): ≤ 500', ask: '≤ 500 mg/L', unit: 'mg/L' },
    { key: 'ec', label: 'EC (µS/cm): ≤ 300', ask: '≤ 300 µS/cm', unit: 'µS/cm' },
  ];

  const handleAskStandard = async (item) => {
    const observed = latestValues ? latestValues[item.key] : undefined;
    const q = observed !== undefined
      ? `Given the standard for ${item.key.toUpperCase()} is ${item.ask}, our observed value is ${observed}. What actions should we take to meet/maintain the standard in line with Indian and global guidelines?`
      : `What actions should we take to keep ${item.key.toUpperCase()} within ${item.ask} in line with Indian and global guidelines?`;
    await handleSend(q, item.key);
  };

  const handleSend = async (overrideQuestion = null, overrideParam = null) => {
    const baseQuestion = (overrideQuestion ?? input).trim();
    if (!baseQuestion) return;

    const userMsg = { role: 'user', content: baseQuestion };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideQuestion) setInput('');

    try {
      setLoading(true);
      const payload = {
        question: baseQuestion,
        param: (overrideParam ?? param) || undefined,
        value: overrideParam ? (latestValues ? latestValues[overrideParam] : undefined) : currentValue,
        stationName: stationName || undefined,
        standards: standards || undefined,
        maxTokens: 220,
      };
      const resp = await api.post('/ai/ask', payload);
      const answer = resp?.data?.answer || resp?.data?.message || 'No answer received.';

      // Simulate thinking delay (500ms - 1000ms)
      const delay = 500 + Math.floor(Math.random() * 500);
      setTyping(true);
      await new Promise((r) => setTimeout(r, delay));

      // Typewriter effect
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      let i = 0;
      const typeSpeed = 12; // ms per character
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          i += 3; // add 3 chars each tick for speed
          const chunk = answer.slice(0, i);
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: chunk };
            return copy;
          });
          if (i >= answer.length) {
            clearInterval(interval);
            resolve();
          }
        }, typeSpeed);
      });
      setTyping(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reach AI.';
      setMessages((prev) => [...prev, { role: 'system', content: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4" style={{ fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        {param && (
          <div className="text-xs text-muted-foreground">
            Context: {param.toUpperCase()} {currentValue !== undefined ? `(value: ${Number(currentValue).toFixed ? Number(currentValue).toFixed(2) : currentValue})` : ''} {stationName ? `@ ${stationName}` : ''}
          </div>
        )}
      </div>

      <div className="h-64 border rounded p-3 bg-muted/20 overflow-y-auto text-left">
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">Start by asking a question about water quality, mitigation, standards, or actions.</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className="text-sm text-left">
                <span className={`font-medium ${m.role === 'user' ? 'text-blue-700' : m.role === 'assistant' ? 'text-green-700' : 'text-red-700'}`}>
                  {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Assistant' : 'System'}:
                </span>
                <span
                  className="whitespace-pre-wrap ml-2"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                />
              </div>
            ))}
            {typing && (
              <div className="text-sm text-green-700">
                <span className="font-medium">Assistant:</span>
                <span className="ml-2 inline-flex items-center gap-1 opacity-70">
                  typing
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce"></span>
                  <span className="inline-block w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about water quality and environment (India/global context)."
          className="min-h-[60px]"
        />
        <Button onClick={() => handleSend()} disabled={loading}>
          {loading ? 'Asking…' : 'Send'}
        </Button>
      </div>
    </Card>
  );
}
