import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDraft } from '../api/announcements';

export default function CreateDiscussionPage() {
    const nav = useNavigate();
    const [title, setTitle] = useState('');
    const [body, setBody]   = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            setErr('Title and body are required');
            return;
        }
        setErr('');
        setLoading(true);
        try {
            const doc = await createDraft({ title: title.trim(), body: body.trim() });
            nav(`/forum/${doc._id}`); // тимчасово; працюватиме і через fallback
        } catch (e) {
            setErr(e?.response?.data?.error || e.message || 'Failed to create');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Create announcement (draft)</h1>
            {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
            <form onSubmit={onSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input className="w-full border rounded px-3 py-2"
                           value={title} onChange={e=>setTitle(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm mb-1">Body</label>
                    <textarea className="w-full border rounded px-3 py-2" rows={8}
                              value={body} onChange={e=>setBody(e.target.value)} required />
                </div>
                <button disabled={loading}
                        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50">
                    {loading ? 'Creating…' : 'Create draft'}
                </button>
            </form>
        </div>
    );
}
