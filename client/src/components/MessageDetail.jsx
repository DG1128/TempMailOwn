import React, { useState, useEffect, useRef } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Download, 
  Printer, 
  FileText, 
  Code, 
  Eye, 
  EyeOff, 
  Paperclip, 
  ShieldCheck, 
  Sparkles,
  MailCheck
} from 'lucide-react';
import DOMPurify from 'dompurify';
import confetti from 'canvas-confetti';
import { extractVerificationInfo } from '../utils/otpExtractor';
import { playCopyPop } from '../utils/audio';

export default function MessageDetail({
  message,
  isLoading,
  onDeleteMessage,
  onShowToast,
  authToken,
  provider,
}) {
  const [viewMode, setViewMode] = useState('html'); // 'html' | 'text' | 'headers'
  const [blockImages, setBlockImages] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [bodyCopied, setBodyCopied] = useState(false);
  const iframeRef = useRef(null);

  const otpInfo = extractVerificationInfo(message);

  // Copy detected verification code
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    playCopyPop();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
    });
    onShowToast?.(`Verification Code ${code} copied!`, 'success');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Copy full body
  const handleCopyBody = () => {
    const textContent = message?.text || (message?.html ? message.html.replace(/<[^>]+>/g, '') : '');
    navigator.clipboard.writeText(textContent);
    setBodyCopied(true);
    playCopyPop();
    onShowToast?.('Email text copied to clipboard', 'info');
    setTimeout(() => setBodyCopied(false), 2000);
  };

  // Download EML
  const handleDownloadEML = () => {
    if (!message) return;
    const content = `From: ${message.from?.address || ''}\nTo: ${message.to?.[0]?.address || ''}\nSubject: ${message.subject || ''}\nDate: ${message.createdAt || ''}\n\n${message.text || message.html || ''}`;
    const blob = new Blob([content], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(message.subject || 'email').replace(/[^a-z0-9]/gi, '_')}.eml`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Downloaded .eml file', 'info');
  };

  // Print email
  const handlePrint = () => {
    if (!message) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${message.subject || 'Email'}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #111; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
            .meta { font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${message.subject || '(No Subject)'}</div>
            <div class="meta"><strong>From:</strong> ${message.from?.name || ''} &lt;${message.from?.address || ''}&gt;</div>
            <div class="meta"><strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}</div>
          </div>
          <div>${message.html || `<pre>${message.text || ''}</pre>`}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Render HTML in sandboxed iframe safely
  useEffect(() => {
    if (viewMode === 'html' && message?.html && iframeRef.current) {
      let sanitizedHtml = DOMPurify.sanitize(message.html, {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['target'],
      });

      // Inject base styles for pleasant viewing
      const htmlWrapper = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                margin: 16px;
                line-height: 1.6;
                color: #222222;
                background-color: #ffffff;
                word-break: break-word;
              }
              a { color: #4f46e5; text-decoration: underline; }
              img { max-width: 100%; height: auto; display: ${blockImages ? 'none' : 'initial'}; }
              table { max-width: 100% !important; }
            </style>
          </head>
          <body>
            ${sanitizedHtml}
          </body>
        </html>
      `;

      iframeRef.current.srcdoc = htmlWrapper;
    }
  }, [message, viewMode, blockImages]);

  if (!message) {
    return (
      <div className="glass-panel message-detail-column" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <MailCheck size={30} color="var(--text-dim)" />
        </div>
        <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-main)', marginBottom: '6px' }}>
          Select an Email to Read
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-dim)', maxWidth: '340px' }}>
          Pick any received message from the left inbox list to view sanitized content, auto-extracted OTP codes, and attachments.
        </div>
      </div>
    );
  }

  const senderInitial = (message.from?.name || message.from?.address || 'U')[0].toUpperCase();
  const senderDisplay = message.from?.name ? `${message.from.name} <${message.from.address}>` : message.from?.address;
  const recipientDisplay = message.to?.map((t) => t.address).join(', ') || '';

  return (
    <div className="glass-panel message-detail-column">
      {/* Header Info */}
      <div className="detail-header">
        <div className="detail-title-row">
          <div className="detail-subject">
            {message.subject || '(No Subject)'}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={handleCopyBody} 
              title="Copy email text"
            >
              {bodyCopied ? <Check size={15} color="var(--accent-emerald)" /> : <Copy size={15} />}
            </button>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={handleDownloadEML} 
              title="Download .eml file"
            >
              <Download size={15} />
            </button>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={handlePrint} 
              title="Print email"
            >
              <Printer size={15} />
            </button>
            <button 
              className="btn btn-danger btn-icon" 
              onClick={() => onDeleteMessage(message.id)} 
              title="Delete this email"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Sender & Recipient Meta */}
        <div className="detail-meta-row">
          <div className="sender-pill">
            <div className="sender-avatar">{senderInitial}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                {message.from?.name || message.from?.address}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                From: {senderDisplay} &bull; To: {recipientDisplay}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'right' }}>
            {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ⚡ SMART OTP / VERIFICATION EXTRACTOR BANNER */}
      {otpInfo && (
        <div className="otp-highlight-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-secondary)', letterSpacing: '0.05em' }}>
                Auto-Detected Verification Code
              </div>
              {otpInfo.code ? (
                <div className="otp-code-box" style={{ marginTop: '2px' }}>
                  <span className="otp-digit">{otpInfo.code}</span>
                </div>
              ) : (
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  Verification Link Available
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {otpInfo.code && (
              <button 
                className={`btn ${codeCopied ? 'btn-success' : 'btn-primary'}`} 
                onClick={() => handleCopyCode(otpInfo.code)}
              >
                {codeCopied ? <Check size={15} /> : <Copy size={15} />}
                <span>{codeCopied ? 'Code Copied!' : `Copy Code: ${otpInfo.code}`}</span>
              </button>
            )}

            {otpInfo.confirmationLink && (
              <a
                href={otpInfo.confirmationLink.url}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                <ExternalLink size={14} />
                <span>{otpInfo.confirmationLink.label || 'Open Verification Link'}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* View Mode Bar */}
      <div className="detail-view-tabs" style={{ marginTop: '12px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div 
            className={`detail-view-tab ${viewMode === 'html' ? 'active' : ''}`}
            onClick={() => setViewMode('html')}
          >
            HTML Preview
          </div>
          <div 
            className={`detail-view-tab ${viewMode === 'text' ? 'active' : ''}`}
            onClick={() => setViewMode('text')}
          >
            Plain Text
          </div>
          <div 
            className={`detail-view-tab ${viewMode === 'headers' ? 'active' : ''}`}
            onClick={() => setViewMode('headers')}
          >
            Headers & Meta
          </div>
        </div>

        {viewMode === 'html' && (
          <button 
            className="btn btn-ghost" 
            style={{ fontSize: '11px', padding: '2px 8px' }}
            onClick={() => setBlockImages(!blockImages)}
            title={blockImages ? 'Remote images are hidden for privacy' : 'Click to hide external images'}
          >
            {blockImages ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{blockImages ? 'Images Blocked' : 'Images Visible'}</span>
          </button>
        )}
      </div>

      {/* Email Body Stage */}
      <div className="email-content-stage">
        {viewMode === 'html' ? (
          message.html ? (
            <iframe
              ref={iframeRef}
              title="Email Content"
              className="email-iframe-frame"
              sandbox="allow-same-origin allow-popups"
            />
          ) : (
            <div className="raw-text-view">
              {message.text || '(Empty Message Body)'}
            </div>
          )
        ) : viewMode === 'text' ? (
          <div className="raw-text-view">
            {message.text || (message.html ? message.html.replace(/<[^>]+>/g, '') : '(No text available)')}
          </div>
        ) : (
          /* Headers & Technical Metadata */
          <div className="raw-text-view">
            <div><strong>Message-ID:</strong> {message.msgId || message.id}</div>
            <div><strong>From:</strong> {senderDisplay}</div>
            <div><strong>To:</strong> {recipientDisplay}</div>
            <div><strong>Date:</strong> {message.createdAt}</div>
            <div><strong>Size:</strong> {(message.size / 1024).toFixed(2)} KB</div>
            <div><strong>Has Attachments:</strong> {message.hasAttachments ? 'Yes' : 'No'}</div>
            <div><strong>Upstream Provider:</strong> {provider || 'Mail.gw'}</div>
          </div>
        )}
      </div>

      {/* Attachments Tray (If Any) */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="attachment-tray">
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Paperclip size={14} /> Attachments ({message.attachments.length}):
          </span>
          {message.attachments.map((att, idx) => {
            const downloadUrl = `/api/mailbox/attachment?url=${encodeURIComponent(att.downloadUrl)}&filename=${encodeURIComponent(att.filename)}`;
            return (
              <a
                key={att.id || idx}
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="attachment-pill"
                download={att.filename}
              >
                <Download size={13} color="var(--accent-primary)" />
                <span>{att.filename}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  ({(att.size / 1024).toFixed(1)} KB)
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
