"use client";

import { MessageSquare, UserPlus, CreditCard, Home } from 'lucide-react';

type Activity = {
    id: string;
    type: 'resident' | 'payment' | 'request' | 'room';
    message: string;
    time: string;
    status?: string;
};

const ICON_MAP = {
    resident: <UserPlus size={14} />,
    payment: <CreditCard size={14} />,
    request: <MessageSquare size={14} />,
    room: <Home size={14} />
};

const COLOR_MAP = {
    resident: '#34d399',
    payment: '#fbbf24',
    request: 'var(--accent-primary)',
    room: '#a78bfa'
};

export function ActivityTimeline({ activities }: { activities?: Activity[] }) {
    // Mocking some internal activities if none provided
    const displayActivities = activities || [
        { id: '1', type: 'resident', message: 'New resident onboarded: Rahul K.', time: '2h ago' },
        { id: '2', type: 'payment', message: 'Rent payment received for Room 104', time: '4h ago' },
        { id: '3', type: 'request', message: 'Maintenance requested in Room 202', time: 'Yesterday' },
        { id: '4', type: 'room', message: 'Room 305 marked as available', time: '2 days ago' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            {displayActivities.map((act, i) => (
                <div key={act.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {/* Line */}
                    {i !== displayActivities.length - 1 && (
                        <div style={{
                            position: 'absolute', left: '15px', top: '30px', bottom: '-10px',
                            width: '1px', background: 'var(--border-subtle)'
                        }} />
                    )}

                    {/* Icon */}
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: `${COLOR_MAP[act.type as keyof typeof COLOR_MAP]}15`,
                        border: `1px solid ${COLOR_MAP[act.type as keyof typeof COLOR_MAP]}25`,
                        color: COLOR_MAP[act.type as keyof typeof COLOR_MAP],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1, flexShrink: 0
                    }}>
                        {ICON_MAP[act.type as keyof typeof ICON_MAP]}
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: 4 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {act.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            {act.time}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
