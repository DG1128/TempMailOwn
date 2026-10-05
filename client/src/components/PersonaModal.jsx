import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Copy, 
  Check, 
  Shuffle, 
  Briefcase, 
  Phone, 
  MapPin, 
  Calendar, 
  Building,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { playCopyPop } from '../utils/audio';

export default function PersonaModal({ isOpen, onClose, onShowToast }) {
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const fetchPersona = () => {
    setLoading(true);
    axios
      .get('/api/fake-persona')
      .then((res) => {
        if (res.data.success && res.data.persona) {
          setPersona(res.data.persona);
        }
      })
      .catch((err) => {
        console.warn('Failed to load persona:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && !persona) {
      fetchPersona();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    playCopyPop();
    onShowToast?.(`Copied ${fieldName}: ${text}`, 'success');
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyAll = () => {
    if (!persona) return;
    const formatted = `Name: ${persona.fullName}\nPhone: ${persona.phone}\nAddress: ${persona.street}, ${persona.city}, ${persona.state} ${persona.zip}, ${persona.country}\nCompany: ${persona.company}\nJob Title: ${persona.jobTitle}\nBirth Date: ${persona.birthDate}`;
    navigator.clipboard.writeText(formatted);
    setCopiedField('all');
    playCopyPop();
    onShowToast?.('Copied full identity profile!', 'success');
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
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
              <User size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>
                Fake Persona & Identity Generator
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Bypass registration forms with 1-click synthetic details
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={fetchPersona} disabled={loading} title="Generate new random identity">
              <Shuffle size={14} className={loading ? 'animate-spin' : ''} />
              <span>Generate New</span>
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {persona ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* Full Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Full Name</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Click copy to paste in form</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" readOnly className="form-input" value={persona.fullName} />
                  <button
                    className={`btn ${copiedField === 'Name' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(persona.fullName, 'Name')}
                  >
                    {copiedField === 'Name' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" readOnly className="form-input mono" value={persona.phone} />
                  <button
                    className={`btn ${copiedField === 'Phone' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(persona.phone, 'Phone')}
                  >
                    {copiedField === 'Phone' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Birth Date */}
              <div className="form-group">
                <label className="form-label">Birth Date</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" readOnly className="form-input mono" value={persona.birthDate} />
                  <button
                    className={`btn ${copiedField === 'BirthDate' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(persona.birthDate, 'BirthDate')}
                  >
                    {copiedField === 'BirthDate' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Street Address */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Street Address</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" readOnly className="form-input" value={persona.street} />
                  <button
                    className={`btn ${copiedField === 'Address' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(persona.street, 'Address')}
                  >
                    {copiedField === 'Address' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* City & State */}
              <div className="form-group">
                <label className="form-label">City, State & Zip</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={`${persona.city}, ${persona.state} ${persona.zip}`}
                  />
                  <button
                    className={`btn ${copiedField === 'CityState' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(`${persona.city}, ${persona.state} ${persona.zip}`, 'CityState')}
                  >
                    {copiedField === 'CityState' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label">Country</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" readOnly className="form-input" value={persona.country} />
                  <button
                    className={`btn ${copiedField === 'Country' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(persona.country, 'Country')}
                  >
                    {copiedField === 'Country' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Company & Role */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Company & Job Title</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={`${persona.company} — ${persona.jobTitle}`}
                  />
                  <button
                    className={`btn ${copiedField === 'Company' ? 'btn-success' : 'btn-secondary'} btn-icon`}
                    onClick={() => handleCopy(`${persona.company} — ${persona.jobTitle}`, 'Company')}
                  >
                    {copiedField === 'Company' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
              Loading identity parameters...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className={`btn ${copiedField === 'all' ? 'btn-success' : 'btn-primary'}`} onClick={handleCopyAll}>
            {copiedField === 'all' ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedField === 'all' ? 'Copied Full Profile!' : 'Copy Full Profile'}</span>
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
