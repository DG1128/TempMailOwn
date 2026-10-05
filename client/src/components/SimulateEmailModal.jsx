import React, { useState } from 'react';
import { 
  Zap, 
  X, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  KeyRound, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';
import axios from 'axios';

export default function SimulateEmailModal({
  isOpen,
  onClose,
  activeAddress,
  onEmailSent,
  onShowToast,
}) {
  const [senderType, setSenderType] = useState('auth');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'auth',
      name: 'GitHub Security',
      subject: '[GitHub] Please verify your one-time code',
      desc: 'Sends a 6-digit 2FA confirmation code email with official GitHub styling.',
      badge: '2FA OTP Code',
      color: '#6366f1',
    },
    {
      id: 'google',
      name: 'Google Accounts',
      subject: 'Google verification code: ******',
      desc: 'Simulates a recovery email confirmation message with Google security design.',
      badge: 'Google PIN',
      color: '#06b6d4',
    },
    {
      id: 'discord',
      name: 'Discord Verification',
      subject: 'Your Discord Security PIN is ******',
      desc: 'Sends a Discord account authorization email with instant PIN extractor.',
      badge: 'Discord PIN',
      color: '#8b5cf6',
    },
  ];

  const handleSend = async () => {
    if (!activeAddress) return;
    setSending(true);
    try {
      const res = await axios.post('/api/mailbox/simulate-email', {
        address: activeAddress,
        senderType: senderType,
      });

      if (res.data.success) {
        onShowToast?.(`⚡ Test email delivered! OTP code: ${res.data.otp}`, 'success');
        onEmailSent?.();
        onClose();
      }
    } catch (err) {
      console.error('Error simulating email:', err);
      onShowToast?.('Failed to simulate test email', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={20} color="var(--accent-amber)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Instant Test Email Simulator
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Test your inbox, OTP extractor & chime in real time
              </div>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Deliver an authentic test email to your current active temporary address:{' '}
            <strong className="mono" style={{ color: 'var(--accent-secondary)' }}>{activeAddress}</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {presets.map((p) => {
              const isSelected = senderType === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSenderType(p.id)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                        {p.name}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                        {p.badge}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {p.subject}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {p.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            <Send size={15} className={sending ? 'animate-spin' : ''} />
            <span>{sending ? 'Delivering...' : 'Send Test Email Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
