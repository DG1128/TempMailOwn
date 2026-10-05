import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Shuffle, 
  Globe2,
  CheckCircle2,
  Building
} from 'lucide-react';

const HUMAN_NAMES = [
  'alex.morgan',
  'david.miller',
  'sarah.jenkins',
  'michael.clark',
  'emma.watson',
  'james.wilson',
  'olivia.taylor',
  'daniel.anderson',
  'sophia.thomas',
  'ethan.harris',
  'lucas.martin',
  'chloe.robinson',
  'marcus.vance',
  'elena.cross',
];

export default function CustomizeModal({
  isOpen,
  onClose,
  domains = [],
  onCreateMailbox,
  isCreating,
}) {
  const [username, setUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('all');
  const [lockOnCreate, setLockOnCreate] = useState(false);
  const [customPassword, setCustomPassword] = useState('');

  if (!isOpen) return null;

  const activeDomainList = domains.length > 0 ? domains : [
    { domain: 'ruutukf.com', provider: 'tempmail_io', stealthScore: 98, badge: 'Verified .COM', region: '🇺🇸 US CDN' },
    { domain: 'yzcalo.com', provider: 'tempmail_io', stealthScore: 97, badge: 'Verified .COM', region: '🇺🇸 US CDN' },
    { domain: 'maxxspace.com', provider: 'mailtm', stealthScore: 99, badge: 'Enterprise .COM', region: '🇩🇪 Cloudflare' },
    { domain: 'sharklasers.com', provider: 'guerrillamail', stealthScore: 98, badge: 'Popular .COM', region: '🛡️ Infallible' },
    { domain: 'guerrillamail.com', provider: 'guerrillamail', stealthScore: 96, badge: 'Veteran .COM', region: '🛡️ Infallible' },
    { domain: 'grr.la', provider: 'guerrillamail', stealthScore: 94, badge: 'Clean Tier', region: '🛡️ Infallible' },
  ];

  const filteredDomains = activeDomainList.filter((d) => {
    if (selectedProviderFilter === 'all') return true;
    return d.provider === selectedProviderFilter;
  });

  const currentDomain = selectedDomain || filteredDomains[0]?.domain || activeDomainList[0]?.domain;
  const currentDomainObj = activeDomainList.find((d) => d.domain === currentDomain) || activeDomainList[0];

  const handlePickHumanName = () => {
    const randomName = HUMAN_NAMES[Math.floor(Math.random() * HUMAN_NAMES.length)];
    const randomNum = Math.floor(Math.random() * 89 + 10);
    setUsername(`${randomName}${randomNum}`);
  };

  const handleRandomize = () => {
    const rand = Math.random().toString(36).substring(2, 9);
    setUsername(`user_${rand}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalUsername = (username.trim() || 'user_' + Math.random().toString(36).substring(2, 8)).replace(/[^a-zA-Z0-9._-]/g, '');
    const finalAddress = `${finalUsername}@${currentDomain}`;

    onCreateMailbox({
      address: finalAddress,
      domain: currentDomain,
      provider: currentDomainObj?.provider,
      password: customPassword.trim() || undefined,
      isLocked: lockOnCreate,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Customize Worldwide Temporary Email
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Pick legitimate corporate domains & custom stealth prefixes
              </div>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Generator presets */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                onClick={handlePickHumanName}
                title="Generates names like david.miller94 that look authentic to websites"
              >
                <UserCheck size={14} color="var(--accent-secondary)" />
                <span>Legit Human Name</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                onClick={handleRandomize}
                title="Generates a random secure alphanumeric string"
              >
                <Shuffle size={14} />
                <span>Random Prefix</span>
              </button>
            </div>

            {/* Username Input */}
            <div className="form-group">
              <label className="form-label">Username / Address Prefix</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. alex.morgan84, dev.test99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="form-group">
              <label className="form-label">Filter by Worldwide Provider</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: `All (${activeDomainList.length})` },
                  { id: 'tempmail_io', label: '🇺🇸 US/EU .COM CDN' },
                  { id: 'guerrillamail', label: '🛡️ Guerrilla (9 Domains)' },
                  { id: 'mailtm', label: '🇩🇪 Mail.tm' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`btn ${selectedProviderFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '5px 10px' }}
                    onClick={() => {
                      setSelectedProviderFilter(tab.id);
                      const matching = activeDomainList.filter((d) => tab.id === 'all' || d.provider === tab.id);
                      if (matching.length > 0) setSelectedDomain(matching[0].domain);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Selector with Stealth Rating */}
            <div className="form-group">
              <label className="form-label">Select Business Domain ({filteredDomains.length} available)</label>
              <select
                className="form-select mono"
                value={currentDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {filteredDomains.map((d) => (
                  <option key={d.domain} value={d.domain}>
                    @{d.domain} &bull; [{d.badge || 'Verified'} - {d.stealthScore || 96}% Bypass] ({d.region || d.provider})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Preview Box */}
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                Live Address Preview:
              </div>
              <div className="mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                {(username.trim() || 'yourname')}@{currentDomain}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                  {currentDomainObj?.badge || 'Enterprise .COM'}
                </span>
                <span>Bypass Score: {currentDomainObj?.stealthScore || 98}%</span>
                <span>&bull; {currentDomainObj?.region || 'Global'}</span>
              </div>
            </div>

            {/* Lock in Vault Option */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '8px 4px' }}>
              <input
                type="checkbox"
                checked={lockOnCreate}
                onChange={(e) => setLockOnCreate(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-amber)', marginTop: '2px' }}
              />
              <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                <span style={{ fontWeight: 700 }}>🔒 Lock & Pin in Vault immediately</span>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Saves address credentials permanently so you can re-access this email anytime in the future.
                </div>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isCreating}>
              <Sparkles size={15} />
              <span>{isCreating ? 'Creating Address...' : 'Create Email Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
