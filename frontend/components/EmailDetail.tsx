// import React, { useState, useEffect, useRef } from 'react';
// import { api } from '../services/api';
// import { Email, ChatMessage, Draft } from '../types';
//
// interface EmailDetailProps {
//     email: Email;
// }
//
// export const EmailDetail: React.FC<EmailDetailProps> = ({ email }) => {
//     const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
//     const [input, setInput] = useState('');
//     const [loadingChat, setLoadingChat] = useState(false);
//     const [draft, setDraft] = useState<Draft | null>(null);
//     const [loadingDraft, setLoadingDraft] = useState(false);
//     const scrollRef = useRef<HTMLDivElement>(null);
//
//     // Reset when email changes
//     useEffect(() => {
//         setChatHistory([{ role: 'agent', content: `Hello! I've analyzed this email from ${email.sender}. How can I help?` }]);
//         setDraft(null);
//     }, [email.id]);
//
//     // Auto-scroll chat
//     useEffect(() => {
//         if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }, [chatHistory, draft]);
//
//     const handleSend = async () => {
//         if (!input.trim()) return;
//         const userMsg = input;
//         setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
//         setInput('');
//         setLoadingChat(true);
//
//         try {
//             const res = await api.chatAgent(email.id, userMsg);
//             setChatHistory(prev => [...prev, { role: 'agent', content: res.data.response }]);
//         } catch (err) {
//             setChatHistory(prev => [...prev, { role: 'agent', content: "Sorry, I encountered an error." }]);
//         } finally {
//             setLoadingChat(false);
//         }
//     };
//
//     const handleDraft = async () => {
//         setLoadingDraft(true);
//         try {
//             const res = await api.generateDraft(email.id);
//             setDraft(res.data);
//             setChatHistory(prev => [...prev, { role: 'agent', content: "I've drafted a reply for you below." }]);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoadingDraft(false);
//         }
//     };
//
//     return (
//         <div className="flex h-full bg-white divide-x divide-slate-200">
//             {/* CENTER PANEL: Email Content */}
//             <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
//                 {/* Email Header */}
//                 <div className="px-8 py-6 border-b border-slate-100 flex-shrink-0">
//                     <div className="flex justify-between items-start mb-4">
//                         <h1 className="text-2xl font-bold text-slate-900 leading-snug line-clamp-2 pr-4">{email.subject}</h1>
//                         <div className="text-right flex-shrink-0">
//                             <span className="text-xs font-semibold text-slate-400 block bg-slate-50 px-2 py-1 rounded border border-slate-100">
//                                 {new Date(email.timestamp).toLocaleDateString()}
//                             </span>
//                         </div>
//                     </div>
//
//                     <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
//                             {email.sender[0].toUpperCase()}
//                         </div>
//                         <div>
//                             <p className="text-sm font-bold text-slate-800">{email.sender}</p>
//                             <p className="text-xs text-slate-500">To: You</p>
//                         </div>
//                         <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium border ${
//                             email.category === 'Urgent Work' ? 'bg-rose-50 text-rose-600 border-rose-100' :
//                             'bg-slate-50 text-slate-500 border-slate-100'
//                         }`}>
//                             {email.category}
//                         </span>
//                     </div>
//                 </div>
//
//                 {/* Scrollable Body */}
//                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
//                     {/* AI Analysis Card - Styled to look integrated */}
//                     <div className="mb-8 p-5 bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border border-indigo-100/50 shadow-sm ring-1 ring-indigo-50">
//                         <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2">
//                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
//                             AI Executive Summary
//                         </h3>
//                         <p className="text-slate-700 text-sm leading-relaxed">{email.summary}</p>
//
//                         {email.action_items && email.action_items.length > 0 && (
//                             <div className="mt-4 pt-4 border-t border-indigo-100">
//                                 <ul className="space-y-2">
//                                     {email.action_items.map((item, i) => (
//                                         <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
//                                             <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></div>
//                                             <span className="flex-1 font-medium">{item.task}</span>
//                                             {item.deadline && <span className="text-[10px] font-bold bg-white text-rose-500 border border-rose-100 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">{item.deadline}</span>}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         )}
//                     </div>
//
//                     {/* Actual Email Body */}
//                     <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-7 whitespace-pre-wrap font-sans">
//                         {email.body}
//                     </div>
//                 </div>
//             </div>
//
//             {/* RIGHT PANEL: Agent Chat - Fixed Width */}
//             <div className="w-96 flex flex-col bg-slate-50/50 flex-shrink-0 border-l border-slate-200">
//                 {/* Header */}
//                 <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
//                     <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-green-500"></span>
//                         Agent Assistant
//                     </span>
//                     <span className="text-xs text-slate-400 font-mono">v1.0</span>
//                 </div>
//
//                 {/* Chat History */}
//                 <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
//                     {chatHistory.map((msg, i) => (
//                         <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
//                                 msg.role === 'user'
//                                 ? 'bg-slate-800 text-white rounded-tr-sm'
//                                 : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
//                             }`}>
//                                 {msg.content}
//                             </div>
//                         </div>
//                     ))}
//
//                     {loadingChat && (
//                         <div className="flex items-center gap-1.5 ml-2">
//                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
//                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
//                             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
//                         </div>
//                     )}
//
//                     {draft && (
//                         <div className="mt-4 mx-1 bg-white rounded-xl border border-indigo-200 shadow-md overflow-hidden animate-fade-in-up">
//                             <div className="bg-indigo-50 px-3 py-2 border-b border-indigo-100 flex justify-between items-center">
//                                 <span className="text-[10px] font-bold text-indigo-700 uppercase">Draft Generated</span>
//                             </div>
//                             <div className="p-3">
//                                 <div className="text-xs text-slate-500 mb-1">Subject: {draft.subject}</div>
//                                 <textarea
//                                     readOnly
//                                     className="w-full text-xs text-slate-700 bg-slate-50/50 p-2 rounded border border-slate-100 resize-none h-32 focus:outline-none"
//                                     defaultValue={draft.body}
//                                 />
//                             </div>
//                         </div>
//                     )}
//                 </div>
//
//                 {/* Input Area */}
//                 <div className="p-4 bg-white border-t border-slate-200">
//                     {!draft && !loadingDraft && (
//                         <button
//                             onClick={handleDraft}
//                             disabled={loadingDraft}
//                             className="w-full mb-3 py-2 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 transition-colors shadow-sm flex items-center justify-center gap-2"
//                         >
//                             {loadingDraft ? 'Drafting...' : '✨ Generate Reply Draft'}
//                         </button>
//                     )}
//
//                     <div className="relative">
//                         <input
//                             type="text"
//                             className="w-full pl-3 pr-10 py-2.5 bg-slate-100 border-none rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
//                             placeholder="Ask me anything..."
//                             value={input}
//                             onChange={(e) => setInput(e.target.value)}
//                             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                         />
//                         <button
//                             onClick={handleSend}
//                             className="absolute right-1.5 top-1.5 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
//                         >
//                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };