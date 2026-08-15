import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Sliders, 
  Shuffle, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import { playCopyPop } from '../utils/audio';

export default function EmailBar({
  currentMailbox,
  isLocked,
  onToggleLock,
  onOpenCustomize,
  onGenerateRandom,
  onOpenQR,
  onManualRefresh,
  isRefreshing,
  countdownSecs,
  maxCountdown = 10,
  onShowToast,
  domainStealthInfo,
}) {
  const [copied, setCopied] = useState(false);

  const emailAddress = currentMailbox?.address || 'Generating stealth email...';

  const handleCopy = () => {
    if (!currentMailbox?.address) return;
    navigator.clipboard.writeText(currentMailbox.address);
    setCopied(true);
    playCopyPop();
    onShowToast?.(`Copied to clipboard: ${currentMailbox.address}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate SVG circular stroke offset
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (countdownSecs / maxCountdown) * circumference;

  return (
    <div className="glass-panel email-hero-card">
      {/* Top Meta info row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Temporary Address:
          </span>
          {domainStealthInfo && (
            <span className="badge badge-emerald" title="Bypasses website spam checks and disposable filters">
              <ShieldCheck size={12} />
              {domainStealthInfo.badge || 'Enterprise .COM'} ({domainStealthInfo.stealthScore || 99}% Bypass)
            </span>
          )}
        </div>

        {/* Auto Refresh Countdown Ring & Manual Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="timer-container" title={`Auto-refreshing in ${countdownSecs}s`}>
            <svg className="timer-svg" viewBox="0 0 24 24">
              <circle
                className="timer-circle-bg"
                cx="12"
                cy="12"
                r={radius}
                fill="none"
                strokeWidth="2.5"
              />
              <circle
                className="timer-circle-progress"
                cx="12"
                cy="12"
                r={radius}
                fill="none"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span>{countdownSecs}s</span>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={onManualRefresh} 
            disabled={isRefreshing}
            title="Force refresh inbox messages now"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Email Input Box & Actions Row */}
      <div className="email-display-row">
        {/* Email Address Container */}
        <div className="email-address-wrapper" onClick={handleCopy} style={{ cursor: 'pointer' }}>
          <input
            type="text"
            readOnly
            value={emailAddress}
            className="email-input-text"
            title="Click to copy email address"
          />
          <button 
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            style={{ padding: '8px 18px' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions Cluster */}
        <div className="email-actions-cluster">
          {/* Lock / Pin Button */}
          <button 
            className={`btn ${isLocked ? 'btn-secondary' : 'btn-secondary'}`}
            style={{ 
              borderColor: isLocked ? 'var(--accent-amber)' : 'var(--border-card)',
              background: isLocked ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface-elevated)'
            }}
            onClick={onToggleLock}
            title={isLocked ? 'Mailbox is LOCKED & permanently saved in Vault (Click to unlock)' : 'Lock & save this email in Vault for long-term use'}
          >
            {isLocked ? (
              <>
                <Lock size={15} color="var(--accent-amber)" />
                <span style={{ color: 'var(--accent-amber)' }}>Locked</span>
              </>
            ) : (
              <>
                <Unlock size={15} color="var(--text-muted)" />
                <span>Lock Email</span>
              </>
            )}
          </button>

          {/* Customize / Change Domain Button */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenCustomize}
            title="Choose custom username or select specific business domain"
          >
            <Sliders size={15} />
            <span>Customize</span>
          </button>

          {/* Random Human Name Button */}
          <button 
            className="btn btn-secondary" 
            onClick={onGenerateRandom}
            title="Generate a new random email with high-stealth domain"
          >
            <Shuffle size={15} />
            <span>Randomize</span>
          </button>

          {/* QR Code Button */}
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onOpenQR}
            title="View QR Code for mobile reading"
          >
            <QrCode size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
