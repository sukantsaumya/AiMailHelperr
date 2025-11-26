import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Email, ChatMessage, Draft } from '../types';

interface EmailDetailProps {
    email: Email;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
    const [activeTab, setActiveTab] = useState<'view' | 'agent'>('view');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [loadingDraft, setLoadingDraft] = useState(false);
    
    // Reset state when email changes
    useEffect(() => {
        setChatHistory([
            { role: 'agent', content: `Hello! I've analyzed this email from ${email.sender}. How can I help?` }
        ]);
        setDraft(null);
        setActiveTab('view');
    }, [email.id]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoadingChat(true);

        try {
            const res = await api.chatAgent(email.id, userMsg);
            setChatHistory(prev => [...prev, { role: 'agent', content: res.data.response }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'agent', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleDraft = async () => {
        setLoadingDraft(true);
        setActiveTab('agent'); // Switch to agent view to see result
        try {
            const res = await api.generateDraft(email.id);
            setDraft(res.data);
            setChatHistory(prev => [...prev, { role: 'agent', content: "I've drafted a reply for you. Check the 'Draft' section below." }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDraft(false);
        }
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{email.subject}</h2>
                    <p className="text-sm text-gray-500">From: {email.sender}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDraft}
                        disabled={loadingDraft}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loadingDraft ? 'Drafting...' : '✨ Draft Reply'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Email Content Area */}
                <div className={`flex-1 p-6 overflow-y-auto ${activeTab === 'agent' ? 'hidden md:block w-1/2 border-r' : 'w-full'}`}>
                    <div className="prose max-w-none">
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                            <h4 className="font-semibold text-gray-700 mb-2">AI Summary</h4>
                            <p className="text-gray-600">{email.summary || 'Summary not available yet.'}</p>
                            
                            {email.action_items && (email.action_items.length > 0) && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-gray-700 mb-2">Action Items</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {email.action_items.map((action, i) => (
                                            <li key={i} className="text-gray-600">
                                                {action.task} <span className="text-xs text-red-500 font-mono">({action.deadline || 'No deadline'})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="whitespace-pre-wrap text-gray-800 font-serif leading-relaxed">
                            {email.body}
                        </div>
                    </div>
                </div>

                {/* Agent / Chat Area */}
                <div className={`flex flex-col bg-gray-50 ${activeTab === 'view' ? 'hidden md:flex w-1/3 border-l' : 'w-full'}`}>
                   <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">🤖 Agent Assistant</h3>
                        <button 
                            className="md:hidden text-sm text-blue-600"
                            onClick={() => setActiveTab('view')}
                        >
                            Close
                        </button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loadingChat && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-500 animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        
                        {draft && (
                             <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2">Draft Generated</h4>
                                    <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-yellow-100">
                                        {draft.body}
                                    </div>
                                    <div className="mt-2 text-xs text-center text-gray-400">
                                        Saved to drafts (ID: {draft.id})
                                    </div>
                                </div>
                             </div>
                        )}
                   </div>

                   <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ask about this email..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={loadingChat}
                                className="bg-gray-900 text-white p-2 rounded-md hover:bg-gray-700 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
};
