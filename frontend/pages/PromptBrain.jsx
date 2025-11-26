import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const PromptBrainPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await api.getPrompts();
      setPrompts(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
      setLoading(false);
    }
  };

  const handleSave = async (promptType, text) => {
    try {
      await api.updatePrompt(promptType, text);
      setSaved({ ...saved, [promptType]: true });
      setTimeout(() => {
        setSaved(prev => ({ ...prev, [promptType]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  const promptDescriptions = {
    categorize: 'Defines how emails are automatically categorized into different types (Urgent, Meeting, etc.)',
    summarize: 'Controls how the AI generates concise summaries of email content',
    action_items: 'Instructs the AI on how to extract tasks, deadlines, and actionable items',
    reply_positive: 'Template for generating positive/accepting email responses',
    reply_negative: 'Template for generating polite decline responses'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">AI Configuration</h1>
          <p className="text-gray-600">Customize how the AI agent processes and responds to your emails</p>
        </div>

        {/* Prompts */}
        <div className="space-y-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-900 capitalize block mb-1">
                    {prompt.prompt_type.replace('_', ' ')} Prompt
                  </label>
                  <p className="text-sm text-gray-600">
                    {promptDescriptions[prompt.prompt_type] || 'Configure this AI prompt behavior'}
                  </p>
                </div>

                {saved[prompt.prompt_type] && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    Saved ✓
                  </span>
                )}
              </div>

              <textarea
                defaultValue={prompt.template_text}
                onBlur={(e) => handleSave(prompt.prompt_type, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono bg-gray-50 resize-none"
              />

              <p className="text-xs text-gray-500 mt-2">Changes are saved automatically when you click outside the box</p>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</h4>
              <p className="text-sm text-blue-800">
                Be specific in your prompts. The more detailed your instructions, the better the AI will understand your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};