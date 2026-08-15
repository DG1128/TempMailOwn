import React, { useEffect, useState } from 'react';
import { QrCode, X, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { playCopyPop } from '../utils/audio';

export default function QRCodeModal({
  isOpen,
  onClose,
  emailAddress,
  onShowToast,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && emailAddress) {
      QRCode.toDataURL(emailAddress, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, emailAddress]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    playCopyPop();
    onShowToast?.(`Copied ${emailAddress}`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `tempmail-qr-${emailAddress.split('@')[0]}.png`;
    a.click();
    onShowToast?.('Downloaded QR Code image', 'info');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
              Scan Mobile QR Code
            </span>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Scan with your smartphone camera to quickly copy this email address:
          </div>

          {/* QR Code Container */}
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', margin: '8px 0' }}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="TempMail QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
            ) : (
              <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Generating QR...
              </div>
            )}
          </div>

          <div className="mono" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {emailAddress}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Address'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleDownloadQR}>
            <Download size={14} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
