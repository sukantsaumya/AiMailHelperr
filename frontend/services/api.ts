import axios from 'axios';
import { Email, Prompt, Draft } from '../types';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log('🔧 API Service initialized with URL:', API_URL);

// Test connection on load
axios.get(`${API_URL}/emails`)
    .then(() => console.log('✅ Backend connection successful'))
    .catch(err => console.error('❌ Backend connection failed:', err.message));

export const api = {
    ingestInbox: async () => {
        console.log('📧 [API] Calling POST /ingest...');
        try {
            const response = await axios.post(`${API_URL}/ingest`);
            console.log('✅ [API] Ingest response:', response.data);
            return response;
        } catch (error: any) {
            console.error('❌ [API] Ingest error:', error.response?.data || error.message);
            throw error;
        }
    },

    getEmails: async () => {
        console.log('📬 [API] Calling GET /emails...');
        try {
            const response = await axios.get<Email[]>(`${API_URL}/emails`);
            console.log(`✅ [API] Received ${response.data.length} emails`);
            return response;
        } catch (error: any) {
            console.error('❌ [API] Get emails error:', error.message);
            throw error;
        }
    },

    getEmail: async (id: number) => {
        console.log(`📨 [API] Calling GET /emails/${id}...`);
        return axios.get<Email>(`${API_URL}/emails/${id}`);
    },

    getPrompts: async () => {
        console.log('📝 [API] Calling GET /prompts...');
        return axios.get<Prompt[]>(`${API_URL}/prompts`);
    },

    updatePrompt: async (type: string, text: string) => {
        console.log(`📝 [API] Updating prompt: ${type}`);
        return axios.post<Prompt>(`${API_URL}/prompts/update`, {
            prompt_type: type,
            template_text: text
        });
    },

    chatAgent: async (emailId: number, query: string) => {
        console.log(`💬 [API] Sending chat query for email ${emailId}...`);
        try {
            const response = await axios.post<{response: string}>(`${API_URL}/chat/agent`, {
                email_id: emailId,
                user_query: query
            });
            console.log('✅ [API] Chat response received');
            return response;
        } catch (error: any) {
            console.error('❌ [API] Chat error:', error.response?.data || error.message);
            throw error;
        }
    },

    generateDraft: async (emailId: number, instruction?: string) => {
        console.log(`✍️ [API] Generating draft for email ${emailId}...`);
        try {
            const response = await axios.post<Draft>(`${API_URL}/drafts/generate`, {
                email_id: emailId,
                user_instruction: instruction
            });
            console.log('✅ [API] Draft generated');
            return response;
        } catch (error: any) {
            console.error('❌ [API] Draft generation error:', error.response?.data || error.message);
            throw error;
        }
    }
};