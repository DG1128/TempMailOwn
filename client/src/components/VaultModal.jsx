import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Tag, 
  Key, 
  ShieldCheck, 
  Plus, 
  X,
  Clock
} from 'lucide-react';
import { playCopyPop } from '../utils/audio';

export default function VaultModal({
  isOpen,
  onClose,
  vaultItems = [],
  onRestoreToTab,
  onRemoveFromVault,
  onUpdateNote,
  onImportVault,
  onShowToast,
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    playCopyPop();
    onShowToast?.(`Copied ${text}`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveNote = (id) => {
    onUpdateNote(id, noteText);
    setEditingNoteId(null);
    setNoteText('');
  };

  // Export Vault to JSON
  const handleExportVault = () => {
    const dataStr = JSON.stringify(vaultItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempmail-pro-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Exported Vault backup file', 'info');
  };

  // Import Vault from JSON
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          onImportVault(imported);
          onShowToast?.(`Imported ${imported.length} mailboxes into Vault`, 'success');
        } else {
          onShowToast?.('Invalid backup file format', 'error');
        }
      } catch (err) {
        onShowToast?.('Failed to read JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Locked Mailbox Vault ({vaultItems.length})
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Permanent credentials saved locally for long-term signups and logins
              </div>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Quick Actions (Export / Import Backup) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              🔒 Locked emails never expire or delete accidentally.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '11px', padding: '5px 10px' }}
                onClick={handleExportVault}
                disabled={vaultItems.length === 0}
                title="Export vault as JSON backup"
              >
                <Download size={13} />
                <span>Export Backup</span>
              </button>

              <label 
                className="btn btn-secondary" 
                style={{ fontSize: '11px', padding: '5px 10px', cursor: 'pointer' }}
                title="Restore from JSON backup"
              >
                <Upload size={13} />
                <span>Import</span>
                <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* List of Vault Items */}
          {vaultItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              <Lock size={36} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>
                No Locked Emails in Vault Yet
              </div>
              <div style={{ fontSize: '12px', maxWidth: '360px', margin: '0 auto', lineHeight: '1.4' }}>
                Click the <strong>"Lock Email"</strong> button on your active email bar to pin and protect accounts you want to keep for long-term website access.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vaultItems.map((item) => (
                <div
                  key={item.id || item.address}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>
                          {item.address}
                        </span>
                        <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                          <Lock size={10} /> Locked
                        </span>
                      </div>

                      {/* Tag / Note */}
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {editingNoteId === item.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '3px 8px', fontSize: '12px' }}
                              placeholder="e.g. Netflix Trial, GitHub"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              autoFocus
                            />
                            <button className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => handleSaveNote(item.id)}>
                              Save
                            </button>
                            <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: '11px' }} onClick={() => setEditingNoteId(null)}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div 
                            style={{ fontSize: '12px', color: item.note ? 'var(--accent-secondary)' : 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setNoteText(item.note || '');
                            }}
                            title="Click to edit label/note"
                          >
                            <Tag size={12} />
                            <span>{item.note || '+ Add Note / Label'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        onClick={() => {
                          onRestoreToTab(item);
                          onClose();
                        }}
                        title="Open and check this email in an active tab"
                      >
                        <ExternalLink size={13} />
                        <span>Open Tab</span>
                      </button>

                      <button
                        className="btn btn-danger btn-icon"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => onRemoveFromVault(item.id || item.address)}
                        title="Unlock and remove from vault"
                      >
                        <Unlock size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Credentials row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Key size={12} />
                      <span>Password: <strong className="mono" style={{ color: 'var(--text-muted)' }}>{item.password || '••••••••'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
                        onClick={() => handleCopy(item.address, `${item.id}-addr`)}
                      >
                        {copiedKey === `${item.id}-addr` ? 'Copied Addr!' : 'Copy Addr'}
                      </button>
                      {item.password && (
                        <button
                          className="btn-ghost"
                          style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
                          onClick={() => handleCopy(item.password, `${item.id}-pass`)}
                        >
                          {copiedKey === `${item.id}-pass` ? 'Copied Pass!' : 'Copy Pass'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
