import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Prompt } from '../types';

export const PromptBrain: React.FC = () => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        try {
            const res = await api.getPrompts();
            setPrompts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (type: string, text: string) => {
        setSaving(type);
        try {
            await api.updatePrompt(type, text);
            // Relaxed success indication
            setTimeout(() => setSaving(null), 1000);
        } catch (err) {
            console.error(err);
            setSaving(null);
        }
    };

    if (loading) return <div className="p-4 text-gray-500">Loading Brain...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <span>🧠</span> Agent Brain Configuration
            </h2>
            <p className="mb-6 text-gray-600">
                These prompts define how the AI agent perceives and acts on your email. 
                Edit them to change the agent's behavior.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
                {prompts.map((prompt) => (
                    <div key={prompt.prompt_type} className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 capitalize">
                            {prompt.prompt_type.replace('_', ' ')} Prompt
                        </label>
                        <textarea
                            className="w-full h-40 p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-gray-50"
                            defaultValue={prompt.template_text}
                            onBlur={(e) => handleSave(prompt.prompt_type, e.target.value)}
                        />
                        <div className="flex justify-end h-6">
                            {saving === prompt.prompt_type && (
                                <span className="text-xs text-green-600 font-medium animate-pulse">
                                    Saving changes...
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
