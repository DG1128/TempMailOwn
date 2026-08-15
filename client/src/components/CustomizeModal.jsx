import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Shuffle,
  CheckCircle2
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
  const [lockOnCreate, setLockOnCreate] = useState(false);
  const [customPassword, setCustomPassword] = useState('');

  if (!isOpen) return null;

  const activeDomainList = domains.length > 0 ? domains : [
    { domain: 'raleigh-construction.com', stealthScore: 99, badge: 'Enterprise .COM' },
    { domain: 'questtechsystems.com', stealthScore: 99, badge: 'Enterprise .COM' },
    { domain: 'pastryofistanbul.com', stealthScore: 99, badge: 'Enterprise .COM' },
    { domain: 'oakon.com', stealthScore: 96, badge: 'Verified .COM' },
    { domain: 'teihu.com', stealthScore: 96, badge: 'Verified .COM' },
    { domain: 'emalupe.com', stealthScore: 96, badge: 'Verified .COM' },
  ];

  const currentDomain = selectedDomain || activeDomainList[0]?.domain;

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
      password: customPassword.trim() || undefined,
      isLocked: lockOnCreate,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sliders size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Customize Temporary Email
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Pick legitimate corporate domains & custom prefixes
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
                style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                onClick={handlePickHumanName}
                title="Generates names like david.miller94 that look authentic to websites"
              >
                <UserCheck size={14} color="var(--accent-secondary)" />
                <span>Human Name</span>
              </button>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
                onClick={handleRandomize}
                title="Generates a random secure alphanumeric string"
              >
                <Shuffle size={14} />
                <span>Random Prefix</span>
              </button>
            </div>

            {/* Username Input */}
            <div className="form-group">
              <label className="form-label">Username / Prefix</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. alex.miller, dev.test99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Domain Selector with Stealth Rating */}
            <div className="form-group">
              <label className="form-label">Select Business Domain ({activeDomainList.length} Available)</label>
              <select
                className="form-select mono"
                value={currentDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {activeDomainList.map((d) => (
                  <option key={d.domain} value={d.domain}>
                    @{d.domain} &bull; [{d.badge || 'Verified .COM'} - {d.stealthScore || 96}% Bypass]
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Box */}
            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                Live Email Address Preview:
              </div>
              <div className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                {(username.trim() || 'yourname')}@{currentDomain}
              </div>
            </div>

            {/* Lock in Vault Option */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 4px' }}>
              <input
                type="checkbox"
                checked={lockOnCreate}
                onChange={(e) => setLockOnCreate(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-amber)' }}
              />
              <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                <span style={{ fontWeight: 700 }}>🔒 Lock & Pin in Vault immediately</span>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Saves credentials permanently so you can re-access this email anytime later.
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
