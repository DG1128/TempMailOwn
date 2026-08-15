import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Sparkles, 
  Layers, 
  Radio, 
  Database,
  ExternalLink 
} from 'lucide-react';

export default function Header({
  activeDomainsCount,
  vaultCount,
  onOpenVault,
  soundOn,
  onToggleSound,
  currentTheme,
  onChangeTheme,
}) {
  const themes = [
    { id: 'theme-cyber-dark', label: 'Cyber Dark', icon: Moon },
    { id: 'theme-midnight', label: 'OLED Black', icon: Radio },
    { id: 'theme-sunset', label: 'Sunset Violet', icon: Sparkles },
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
            Stealth Disposable Mail & Persistent Vault
          </div>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="badge badge-emerald" title="Live legit business domains ready">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
          <span>{activeDomainsCount || 6} Legit Domains Online</span>
        </div>
        <div className="badge badge-cyan" title="Zero rate limits on free public APIs">
          <span>100% Free & Unlimited</span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="header-actions">
        {/* Saved Mailboxes / Vault Button */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenVault}
          title="Manage Locked & Saved Long-term Mailboxes"
        >
          <Lock size={15} color={vaultCount > 0 ? 'var(--accent-amber)' : 'currentColor'} />
          <span>Vault</span>
          {vaultCount > 0 && (
            <span style={{ 
              background: 'var(--accent-amber)', 
              color: '#000', 
              fontSize: '10px', 
              fontWeight: 800, 
              padding: '1px 6px', 
              borderRadius: '999px' 
            }}>
              {vaultCount}
            </span>
          )}
        </button>

        {/* Audio Notification Toggle */}
        <button 
          className="btn btn-secondary btn-icon" 
          onClick={onToggleSound}
          title={soundOn ? 'Sound alerts enabled (Click to mute)' : 'Sound alerts muted (Click to enable)'}
        >
          {soundOn ? <Volume2 size={16} color="var(--accent-emerald)" /> : <VolumeX size={16} color="var(--text-dim)" />}
        </button>

        {/* Theme Cycle Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={handleNextTheme}
          title={`Current: ${currentThemeObj.label} (Click to switch theme)`}
        >
          <ThemeIcon size={15} />
          <span style={{ fontSize: '12px' }}>{currentThemeObj.label}</span>
        </button>
      </div>
    </header>
  );
}
