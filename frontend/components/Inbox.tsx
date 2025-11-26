import React, { useState, useMemo } from 'react';
import { Email } from '../types';

interface InboxProps {
    emails: Email[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}

const getCategoryColor = (cat: string | undefined) => {
    switch (cat?.toLowerCase()) {
        case 'urgent work': return 'bg-red-100 text-red-800';
        case 'meeting': return 'bg-purple-100 text-purple-800';
        case 'newsletter': return 'bg-green-100 text-green-800';
        case 'spam': return 'bg-gray-100 text-gray-800';
        default: return 'bg-blue-50 text-blue-600';
    }
};

export const Inbox: React.FC<InboxProps> = ({ emails, selectedId, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Read' | 'Unread'>('All');

    // Extract unique categories dynamically from the email list
    const categories = useMemo(() => {
        const uniqueCats = Array.from(new Set(emails.map(e => e.category).filter(Boolean)));
        return ['All', ...uniqueCats.sort()];
    }, [emails]);

    // Filter logic
    const filteredEmails = useMemo(() => {
        return emails.filter(email => {
            // 1. Search Filter (Subject, Body, Sender)
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                email.subject.toLowerCase().includes(query) ||
                email.body.toLowerCase().includes(query) ||
                email.sender.toLowerCase().includes(query);

            // 2. Category Filter
            const matchesCategory = categoryFilter === 'All' || email.category === categoryFilter;

            // 3. Status Filter
            const matchesStatus = 
                statusFilter === 'All' ? true :
                statusFilter === 'Read' ? email.is_read :
                !email.is_read; // Unread

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [emails, searchQuery, categoryFilter, statusFilter]);

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header with Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg text-gray-700">Inbox ({filteredEmails.length})</h2>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Search mail..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <select 
                            className="w-full text-sm border border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map((cat: any) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <select 
                            className="w-full text-sm border border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="All">All Status</option>
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Email List */}
            <div className="overflow-y-auto flex-1">
                {filteredEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                        <p>No emails found.</p>
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setCategoryFilter('All');
                                setStatusFilter('All');
                            }}
                            className="mt-2 text-blue-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    filteredEmails.map((email) => (
                        <div
                            key={email.id}
                            onClick={() => onSelect(email.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${
                                selectedId === email.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                            } ${!email.is_read ? 'bg-white' : 'bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(email.category)}`}>
                                    {email.category || 'Processing...'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(email.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {!email.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Unread"></span>
                                )}
                                <h3 className={`text-sm font-semibold truncate ${!email.is_read ? 'text-black' : 'text-gray-600'}`}>
                                    {email.sender}
                                </h3>
                            </div>
                            <p className={`text-sm truncate ${!email.is_read ? 'font-medium text-gray-900' : 'text-gray-800'}`}>
                                {email.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">{email.body}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};