import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Sparkles, 
  Radio, 
  Activity,
  Zap,
  User,
  Globe2
} from 'lucide-react';

export default function Header({
  activeDomainsCount,
  vaultCount,
  onOpenVault,
  soundOn,
  onToggleSound,
  currentTheme,
  onChangeTheme,
  onOpenStatusModal,
  onOpenSimulateModal,
  onOpenPersonaModal,
}) {
  const themes = [
    { id: 'theme-cyber-dark', label: 'Cyber Dark', icon: Moon },
    { id: 'theme-midnight', label: 'OLED Midnight', icon: Radio },
    { id: 'theme-sunset', label: 'Sunset Neon', icon: Sparkles },
    { id: 'theme-light', label: 'Clean Light', icon: Sun },
  ];

  const handleNextTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onChangeTheme(themes[nextIndex].id);
  };

  const currentThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];
  const ThemeIcon = currentThemeObj.icon;

  return (
    <header className="app-header">
      {/* Brand Area */}
      <div className="brand-logo-area" onClick={() => window.location.reload()}>
        <div className="brand-icon-box">
          <ShieldCheck size={24} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            TempMail <span className="brand-badge">PRO</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-2px' }}>
            Worldwide Stealth Email & Persistent Vault
          </div>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="header-center-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          className="badge badge-emerald"
          onClick={onOpenStatusModal}
          style={{ cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.12)' }}
          title="Click to view real-time latency & health of all global email nodes"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              boxShadow: '0 0 8px var(--accent-emerald)',
              display: 'inline-block',
            }}
          />
          <Globe2 size={12} />
          <span>{activeDomainsCount || 17} Global Domains (3 Providers Online)</span>
        </button>

        <button
          className="badge badge-amber"
          onClick={onOpenSimulateModal}
          style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.12)' }}
          title="Send a 1-click test confirmation email to test OTP extractor"
        >
          <Zap size={12} />
          <span>Instant Test Email</span>
        </button>
      </div>

      {/* Right Header Actions */}
      <div className="header-actions">
        {/* Fake Persona Generator */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenPersonaModal}
          title="Generate synthetic identity (Name, Phone, Address) for sign-ups"
        >
          <User size={14} color="var(--accent-secondary)" />
          <span className="hide-on-mobile">Persona</span>
        </button>

        {/* Saved Mailboxes / Vault Button */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenVault}
          title="Manage Locked & Saved Long-term Mailboxes"
        >
          <Lock size={14} color={vaultCount > 0 ? 'var(--accent-amber)' : 'currentColor'} />
          <span>Vault</span>
          {vaultCount > 0 && (
            <span
              style={{
                background: 'var(--accent-amber)',
                color: '#000',
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '999px',
              }}
            >
              {vaultCount}
            </span>
          )}
        </button>

        {/* Audio Notification Toggle */}
        <button 
          className="btn btn-secondary btn-icon" 
          onClick={onToggleSound}
          title={soundOn ? 'Sound alerts active (Click to mute)' : 'Sound alerts muted (Click to enable)'}
        >
          {soundOn ? <Volume2 size={15} color="var(--accent-emerald)" /> : <VolumeX size={15} color="var(--text-dim)" />}
        </button>

        {/* Theme Cycle Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={handleNextTheme}
          title={`Current Theme: ${currentThemeObj.label} (Click to switch)`}
        >
          <ThemeIcon size={14} />
          <span className="hide-on-mobile" style={{ fontSize: '12px' }}>{currentThemeObj.label}</span>
        </button>
      </div>
    </header>
  );
}
