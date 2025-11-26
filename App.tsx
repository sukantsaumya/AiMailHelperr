import React, { useState, useEffect } from 'react';
import { api } from './frontend/services/api';
import { Email } from './frontend/types';
import { Inbox } from './frontend/components/Inbox';
import { EmailDetail } from './frontend/components/EmailDetail';
import { PromptBrain } from './frontend/components/PromptBrain';

export default function App() {
    const [view, setView] = useState<'inbox' | 'brain'>('inbox');
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            console.log('📬 Fetching emails from backend...');
            const res = await api.getEmails();
            console.log('✅ Got emails:', res.data.length);
            setEmails(res.data);
        } catch (error) {
            console.error("❌ Failed to fetch emails", error);
        }
    };

    const handleIngest = async () => {
        console.log('🚀 Ingest button clicked!');
        setLoading(true);
        try {
            console.log('📤 Calling api.ingestInbox()...');
            const response = await api.ingestInbox();
            console.log('✅ Ingest successful:', response.data);

            // Wait for processing to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('🔄 Refreshing email list...');
            await fetchEmails();

            alert('✅ Emails ingested successfully! Check backend terminal for AI processing logs.');
        } catch (error: any) {
            console.error('❌ Ingest failed:', error);
            alert(`❌ Failed to ingest emails: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const selectedEmail = emails.find(e => e.id === selectedEmailId);

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Navigation Bar */}
            <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
                        A
                    </div>
                    <h1 className="text-lg font-semibold tracking-wide">Prompt-Driven Agent</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('inbox')}
                        className={`px-4 py-2 rounded text-sm font-medium transition ${view === 'inbox' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Inbox
                    </button>
                    <button
                        onClick={() => setView('brain')}
                        className={`px-4 py-2 rounded text-sm font-medium transition ${view === 'brain' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Prompt Brain 🧠
                    </button>
                    <div className="h-6 w-px bg-gray-700 mx-2"></div>
                    <button
                        onClick={handleIngest}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {loading ? (
                           <span className="animate-spin">↻</span>
                       ) : (
                           <span>⬇ Ingest Mock Data</span>
                       )}
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                {view === 'brain' ? (
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            <PromptBrain />
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full h-full">
                        {/* Sidebar Inbox List */}
                        <div className="w-full md:w-1/3 lg:w-1/4 h-full border-r border-gray-200">
                            <Inbox
                                emails={emails}
                                selectedId={selectedEmailId}
                                onSelect={setSelectedEmailId}
                            />
                        </div>

                        {/* Main Detail View */}
                        <div className="hidden md:flex flex-1 h-full bg-white relative">
                            {selectedEmail ? (
                                <div className="absolute inset-0">
                                    <EmailDetail email={selectedEmail} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    <p>Select an email to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}