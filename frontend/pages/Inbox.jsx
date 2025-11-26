import React, { useState, useEffect } from 'react';
import { Search, CheckSquare } from 'lucide-react';
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

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const EmailListSkeleton = () => (
  <div className="space-y-px">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="p-4 bg-white border-b border-gray-100 animate-pulse">
        <div className="flex items-start justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
  </div>
);

export const InboxPage = ({ onSelectEmail }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await api.getEmails();
      setEmails(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">{filteredEmails.length} emails</p>
        </div>

        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <EmailListSkeleton />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!email.is_read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                    <span className={`text-sm font-medium ${email.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {email.sender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getCategoryStyle(email.category)}`}>
                      {email.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(email.timestamp)}</span>
                  </div>
                </div>

                <h3 className={`text-sm mb-1 ${email.is_read ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'}`}>
                  {email.subject}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {email.body}
                </p>

                {email.action_items?.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <CheckSquare className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">
                      {email.action_items.length} action item{email.action_items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};