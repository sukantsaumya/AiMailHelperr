import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Reply, Archive, Sparkles, CheckSquare, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const getCategoryStyle = (category) => {
  const styles = {
    'Urgent Work': 'bg-red-50 text-red-700 border-red-200',
    'Meeting': 'bg-purple-50 text-purple-700 border-purple-200',
    'Newsletter': 'bg-blue-50 text-blue-700 border-blue-200',
    'Spam': 'bg-gray-50 text-gray-600 border-gray-200',
    'Personal': 'bg-green-50 text-green-700 border-green-200',
  };
  return styles[category] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export const EmailDetailPage = ({ email, onBack }) => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: `I've analyzed this email. How can I help you?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    setChatMessages([{ role: 'assistant', content: `I've analyzed this email. How can I help you?` }]);
    setDraft(null);
  }, [email.id]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    const userQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.chatAgent(email.id, userQuery);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setIsLoading(true);
    const prompts = {
      summarize: "Please summarize this email",
      tasks: "Extract all action items from this email"
    };

    setChatMessages(prev => [...prev, { role: 'user', content: prompts[action] }]);

    try {
      const res = await api.chatAgent(email.id, prompts[action]);
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateDraft(email.id);
      setDraft(res.data);
    } catch (error) {
      console.error('Draft generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Email Content - Left Pane */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        {/* Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to inbox
          </button>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200">
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>
        </div>

        {/* Email Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">{email.subject}</h1>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {email.sender[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{email.sender}</p>
                <p className="text-sm text-gray-500">
                  {new Date(email.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <span className={`text-xs px-3 py-1.5 rounded-md border font-medium ${getCategoryStyle(email.category)}`}>
              {email.category}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">AI Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{email.summary}</p>

              {email.action_items?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {email.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-blue-600" />
                        <span className="text-gray-700">{item.task}</span>
                        {item.deadline && (
                          <span className="ml-auto text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                            {item.deadline}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{email.body}</p>
          </div>
        </div>
      </div>

      {/* AI Agent Chat - Right Pane */}
      <div className="w-96 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Always here to help</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <p className="text-xs font-medium text-gray-700 mb-2">Quick Actions</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickAction('summarize')}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              Summarize
            </button>
            <button
              onClick={() => handleQuickAction('tasks')}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              Extract Tasks
            </button>
          </div>
          <button
            onClick={handleGenerateDraft}
            disabled={isLoading}
            className="w-full mt-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            Generate Reply
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            </div>
          )}

          {draft && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-800 mb-2">Draft Generated</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{draft.body}</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask the AI assistant..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};