import React from 'react';
import { Plus, X, Lock, Mail, Shield } from 'lucide-react';

export default function InboxTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  maxTabs = 10,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <div className="inbox-tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const unreadCount = tab.messages?.filter((m) => !m.seen)?.length || 0;

          return (
            <div
              key={tab.id}
              className={`inbox-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              title={tab.address}
            >
              {tab.isLocked ? (
                <Lock size={13} className="inbox-tab-lock-icon" title="Locked & Saved in Vault" />
              ) : (
                <Mail size={13} />
              )}
              
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tab.address.split('@')[0]}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                @{tab.address.split('@')[1]}
              </span>

              {unreadCount > 0 && (
                <span className="inbox-tab-unread">
                  {unreadCount}
                </span>
              )}

              {tabs.length > 1 && (
                <button
                  className="btn-ghost"
                  style={{
                    padding: '2px',
                    borderRadius: '4px',
                    marginLeft: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  title={tab.isLocked ? 'Close tab (Address remains saved in Vault)' : 'Close & discard this inbox'}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        })}

        {tabs.length < maxTabs && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={onAddTab}
            title="Create another concurrent disposable email tab"
          >
            <Plus size={14} />
            <span>New Tab ({tabs.length}/{maxTabs})</span>
          </button>
        )}
      </div>
    </div>
  );
}
