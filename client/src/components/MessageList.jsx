import React, { useState } from 'react';
import { 
  Search, 
  Mail, 
  Paperclip, 
  Trash2, 
  Inbox, 
  KeyRound, 
  Clock, 
  User,
  Radio
} from 'lucide-react';
import { extractVerificationInfo } from '../utils/otpExtractor';

export default function MessageList({
  messages = [],
  selectedMessageId,
  onSelectMessage,
  onClearAllMessages,
  isLoading,
  currentAddress,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Format relative timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    const subject = (m.subject || '').toLowerCase();
    const fromName = (m.from?.name || '').toLowerCase();
    const fromAddress = (m.from?.address || '').toLowerCase();
    const intro = (m.intro || '').toLowerCase();
    return subject.includes(term) || fromName.includes(term) || fromAddress.includes(term) || intro.includes(term);
  });

  return (
    <div className="glass-panel message-list-column">
      {/* List Header */}
      <div className="list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Inbox size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>
            Inbox ({messages.length})
          </span>
        </div>

        {messages.length > 0 && (
          <button 
            className="btn btn-ghost" 
            style={{ fontSize: '11px', padding: '4px 8px' }}
            onClick={onClearAllMessages}
            title="Delete all messages in this mailbox"
          >
            <Trash2 size={13} color="var(--accent-rose)" />
            <span style={{ color: 'var(--accent-rose)' }}>Clear</span>
          </button>
        )}
      </div>

      {/* Search Bar (Shown when messages exist) */}
      {messages.length > 0 && (
        <div className="search-box">
          <Search size={14} color="var(--text-dim)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search sender, subject, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Message Items Scroll View */}
      <div className="message-items-scroll">
        {messages.length === 0 ? (
          <div className="empty-inbox-state">
            <div className="radar-spinner">
              <div className="radar-pulse"></div>
              <Radio size={28} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>
                Waiting for incoming emails...
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', maxWidth: '280px', lineHeight: '1.4' }}>
                Use your temporary address <span className="mono" style={{ color: 'var(--text-muted)' }}>{currentAddress}</span> on any website. Emails will show up here in real time!
              </div>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            No messages match "{searchTerm}"
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = msg.id === selectedMessageId;
            const isUnread = !msg.seen;
            const otpInfo = extractVerificationInfo(msg);
            const senderName = msg.from?.name || msg.from?.address || 'Unknown Sender';

            return (
              <div
                key={msg.id}
                className={`message-item ${isSelected ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                onClick={() => onSelectMessage(msg.id)}
              >
                {/* Top: Sender & Time */}
                <div className="message-item-top">
                  <div className="message-sender">
                    <User size={13} color="var(--accent-secondary)" />
                    <span>{senderName}</span>
                  </div>
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                </div>

                {/* Subject */}
                <div className="message-subject">
                  {msg.subject || '(No Subject)'}
                </div>

                {/* Snippet / Intro */}
                {msg.intro && (
                  <div className="message-snippet">
                    {msg.intro}
                  </div>
                )}

                {/* Bottom Badges: OTP Extracted / Attachments */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                  {otpInfo?.code && (
                    <span className="badge badge-amber" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      <KeyRound size={10} />
                      Code: {otpInfo.code}
                    </span>
                  )}
                  {msg.hasAttachments && (
                    <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      <Paperclip size={10} />
                      Attachment
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
