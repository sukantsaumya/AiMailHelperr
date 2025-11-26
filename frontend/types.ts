export interface ActionItem {
    task: string;
    deadline: string;
}

export interface Email {
    id: number;
    sender: string;
    subject: string;
    body: string;
    timestamp: string;
    is_read: boolean;
    category?: string;
    summary?: string;
    action_items?: ActionItem[];
}

export interface Prompt {
    id: number;
    prompt_type: string;
    template_text: string;
    last_updated: string;
}

export interface Draft {
    id: number;
    email_id: number;
    subject: string;
    body: string;
    status: string;
    created_at: string;
}

export interface ChatMessage {
    role: 'user' | 'agent';
    content: string;
}
