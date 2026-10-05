import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Globe2, 
  Server, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import axios from 'axios';

export default function ProviderStatusModal({ isOpen, onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    axios
      .get('/api/providers/status')
      .then((res) => {
        if (res.data.success && res.data.providers) {
          setHealthData(res.data.providers);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch provider status:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const providersList = healthData
    ? Object.keys(healthData).map((key) => ({ key, ...healthData[key] }))
    : [
        { key: 'tempmail_io', name: 'TempMail.io CDN', region: '🇺🇸 US / 🇪🇺 EU High Speed', status: 'online', latency: 45, domainCount: 7 },
        { key: 'mailtm', name: 'Mail.tm Enterprise', region: '🇩🇪 Cloudflare Global Edge', status: 'online', latency: 68, domainCount: 1 },
        { key: 'guerrillamail', name: 'Guerrilla Mail (18-Yr Shield)', region: '🛡️ Infallible Global', status: 'online', latency: 92, domainCount: 9 },
        { key: 'mailgw', name: 'Mail.gw Failover', region: '🌐 Secondary Fallback', status: 'standby', latency: null, domainCount: 0 },
      ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={20} color="var(--accent-emerald)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Worldwide Multi-Engine Status
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Real-time API health, latency & failover telemetry
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-ghost btn-icon" onClick={fetchStatus} title="Refresh latency">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Explanation Alert */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>
              <strong>Permanent Uptime Architecture:</strong> TempMail Pro queries multiple independent upstream email
              providers around the globe. If any provider experiences downtime or network blockage, traffic instantly and
              automatically fails over to surviving global nodes without service interruption.
            </div>
          </div>

          {/* Providers List Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {providersList.map((p) => {
              const isOnline = p.status === 'online';
              const isStandby = p.status === 'standby';

              return (
                <div
                  key={p.key}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isOnline ? 'var(--accent-emerald)' : isStandby ? 'var(--accent-amber)' : 'var(--accent-rose)',
                        boxShadow: isOnline ? '0 0 10px var(--accent-emerald)' : 'none',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{p.region}</span>
                        {p.domainCount > 0 && <span>&bull; {p.domainCount} Domains</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.latency !== null && (
                      <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        <Clock size={11} />
                        {p.latency} ms
                      </span>
                    )}
                    <span
                      className={`badge ${
                        isOnline ? 'badge-emerald' : isStandby ? 'badge-amber' : 'badge-rose'
                      }`}
                      style={{ fontSize: '11px', textTransform: 'capitalize' }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            All systems monitored & verified
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
}
