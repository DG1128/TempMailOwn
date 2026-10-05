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
  Zap,
  Globe2,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCopyPop } from '../utils/audio';

export default function EmailBar({
  currentMailbox,
  isLocked,
  onToggleLock,
  onOpenCustomize,
  onGenerateRandom,
  onOpenQR,
  onManualRefresh,
  onOpenSimulate,
  onOpenPersona,
  isRefreshing,
  countdownSecs,
  maxCountdown = 10,
  onShowToast,
  domainStealthInfo,
}) {
  const [copied, setCopied] = useState(false);

  const emailAddress = currentMailbox?.address || 'Generating temporary email...';
  const providerKey = currentMailbox?.provider || 'tempmail_io';

  const providerLabels = {
    tempmail_io: { label: 'TempMail CDN', badge: '🇺🇸 US / 🇪🇺 EU High Speed' },
    mailtm: { label: 'Mail.tm Enterprise', badge: '🇩🇪 Cloudflare Edge' },
    guerrillamail: { label: 'Guerrilla Armor', badge: '🛡️ Infallible 18y Shield' },
    mailgw: { label: 'Mail.gw Gateway', badge: '🌐 Failover' },
  };

  const currentProviderInfo = providerLabels[providerKey] || providerLabels.tempmail_io;

  const handleCopy = () => {
    if (!currentMailbox?.address) return;
    navigator.clipboard.writeText(currentMailbox.address);
    setCopied(true);
    playCopyPop();
    confetti({
      particleCount: 40,
      spread: 45,
      origin: { y: 0.4 },
    });
    onShowToast?.(`Copied to clipboard: ${currentMailbox.address}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG circular countdown progress
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (countdownSecs / maxCountdown) * circumference;

  return (
    <div className="glass-panel email-hero-card">
      {/* Top Meta info row */}
      <div className="email-hero-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Active Stealth Address:
          </span>
          {domainStealthInfo && (
            <span className="badge badge-emerald" title="Bypasses website spam checks and disposable filters">
              <ShieldCheck size={12} />
              {domainStealthInfo.badge || 'Enterprise .COM'} ({domainStealthInfo.stealthScore || 99}% Bypass)
            </span>
          )}
          <span className="badge badge-cyan" title="Upstream infrastructure provider">
            <Globe2 size={12} />
            {currentProviderInfo.label} &bull; {domainStealthInfo?.region || currentProviderInfo.badge}
          </span>
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
            title="Check for new messages now"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Email Input Box & Actions Row */}
      <div className="email-display-row">
        {/* Email Address Container */}
        <div className="email-address-wrapper" onClick={handleCopy} title="Click anywhere to copy address">
          <input
            type="text"
            readOnly
            value={emailAddress}
            className="email-input-text mono"
          />
          <button 
            className={`btn ${copied ? 'btn-success' : 'btn-primary'}`} 
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            style={{ padding: '8px 20px', minWidth: '95px' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Actions Cluster */}
        <div className="email-actions-cluster">
          {/* Quick Test Email Button */}
          <button
            className="btn btn-secondary"
            onClick={onOpenSimulate}
            title="Send an instant simulated confirmation email with 6-digit OTP code"
          >
            <Zap size={14} color="var(--accent-amber)" />
            <span>Test Email</span>
          </button>

          {/* Randomize Email */}
          <button 
            className="btn btn-secondary" 
            onClick={onGenerateRandom}
            title="Generate a new address from the healthiest worldwide domain"
          >
            <Shuffle size={14} />
            <span>Randomize</span>
          </button>

          {/* Customize / Select Domain */}
          <button 
            className="btn btn-secondary" 
            onClick={onOpenCustomize}
            title="Choose custom username or select from 17 worldwide domains"
          >
            <Sliders size={14} />
            <span>Customize</span>
          </button>

          {/* Lock / Pin in Vault */}
          <button 
            className="btn btn-secondary"
            style={{ 
              borderColor: isLocked ? 'var(--accent-amber)' : 'var(--border-card)',
              background: isLocked ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface-elevated)'
            }}
            onClick={onToggleLock}
            title={isLocked ? 'Mailbox is LOCKED & saved in Vault' : 'Lock & save this mailbox in Vault'}
          >
            {isLocked ? (
              <>
                <Lock size={14} color="var(--accent-amber)" />
                <span style={{ color: 'var(--accent-amber)' }}>Locked</span>
              </>
            ) : (
              <>
                <Unlock size={14} color="var(--text-muted)" />
                <span>Lock</span>
              </>
            )}
          </button>

          {/* QR Code */}
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onOpenQR}
            title="View QR Code for mobile reading"
          >
            <QrCode size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
