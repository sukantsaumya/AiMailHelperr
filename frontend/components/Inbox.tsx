// import React, { useState, useMemo } from 'react';
// import { Email } from '../types';
//
// interface InboxProps {
//     emails: Email[];
//     selectedId: number | null;
//     onSelect: (id: number) => void;
// }
//
// const getCategoryStyles = (cat: string | undefined) => {
//     switch (cat?.toLowerCase()) {
//         case 'urgent work': return 'bg-rose-100 text-rose-700 border-rose-200';
//         case 'meeting': return 'bg-violet-100 text-violet-700 border-violet-200';
//         case 'newsletter': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
//         case 'spam': return 'bg-slate-100 text-slate-600 border-slate-200';
//         default: return 'bg-blue-50 text-blue-600 border-blue-100';
//     }
// };
//
// export const Inbox: React.FC<InboxProps> = ({ emails, selectedId, onSelect }) => {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [categoryFilter, setCategoryFilter] = useState<string>('All');
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Read' | 'Unread'>('All');
//
//     const categories = useMemo(() => {
//         const uniqueCats = Array.from(new Set(emails.map(e => e.category).filter(Boolean)));
//         return ['All', ...uniqueCats.sort()];
//     }, [emails]);
//
//     const filteredEmails = useMemo(() => {
//         return emails.filter(email => {
//             const query = searchQuery.toLowerCase();
//             const matchesSearch =
//                 email.subject.toLowerCase().includes(query) ||
//                 email.body.toLowerCase().includes(query) ||
//                 email.sender.toLowerCase().includes(query);
//             const matchesCategory = categoryFilter === 'All' || email.category === categoryFilter;
//             const matchesStatus =
//                 statusFilter === 'All' ? true :
//                 statusFilter === 'Read' ? email.is_read :
//                 !email.is_read;
//             return matchesSearch && matchesCategory && matchesStatus;
//         });
//     }, [emails, searchQuery, categoryFilter, statusFilter]);
//
//     return (
//         <div className="flex flex-col h-full bg-white">
//             {/* Header with Filters */}
//             <div className="p-4 border-b border-slate-100 space-y-3 bg-white z-10 sticky top-0">
//                 <div className="flex justify-between items-center">
//                     <h2 className="font-bold text-xl text-slate-800">Inbox</h2>
//                     <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
//                         {filteredEmails.length}
//                     </span>
//                 </div>
//
//                 <div className="relative group">
//                     <input
//                         type="text"
//                         placeholder="Search emails..."
//                         className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                 </div>
//
//                 <div className="flex gap-2">
//                     <select
//                         className="flex-1 text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
//                         value={categoryFilter}
//                         onChange={(e) => setCategoryFilter(e.target.value)}
//                     >
//                         {categories.map((cat: any) => (
//                             <option key={cat} value={cat}>{cat}</option>
//                         ))}
//                     </select>
//                     <select
//                         className="flex-1 text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value as any)}
//                     >
//                         <option value="All">All Status</option>
//                         <option value="Unread">Unread</option>
//                         <option value="Read">Read</option>
//                     </select>
//                 </div>
//             </div>
//
//             {/* Email List */}
//             <div className="overflow-y-auto flex-1 p-2 space-y-1">
//                 {filteredEmails.map((email) => (
//                     <div
//                         key={email.id}
//                         onClick={() => onSelect(email.id)}
//                         className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
//                             selectedId === email.id
//                             ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
//                             : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
//                         }`}
//                     >
//                         {/* Left accent bar for selected state */}
//                         {selectedId === email.id && (
//                             <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full"></div>
//                         )}
//
//                         <div className="flex justify-between items-start mb-2 pl-2">
//                             <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-bold ${getCategoryStyles(email.category)}`}>
//                                 {email.category || 'Processing'}
//                             </span>
//                             <span className="text-xs text-slate-400 font-medium tabular-nums">
//                                 {new Date(email.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
//                             </span>
//                         </div>
//
//                         <div className="pl-2">
//                             <h3 className={`text-sm mb-0.5 flex items-center gap-2 ${!email.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
//                                 {!email.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 block"></span>}
//                                 {email.sender}
//                             </h3>
//                             <p className={`text-sm mb-1 ${!email.is_read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
//                                 {email.subject}
//                             </p>
//                             <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
//                                 {email.body}
//                             </p>
//                         </div>
//                     </div>
//                 ))}
//
//                 {filteredEmails.length === 0 && (
//                     <div className="text-center py-12 text-slate-400">
//                         <p>No emails found.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };