const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache for available domains
let domainsCache = {
  data: [],
  lastUpdated: 0,
};

const PROVIDER_URLS = {
  mailgw: 'https://api.mail.gw',
  mailtm: 'https://api.mail.tm',
};

// Calculate stealth / quality rating for a domain
function calculateStealthScore(domain) {
  const lower = domain.toLowerCase();
  const tld = lower.split('.').pop();
  
  if (lower.includes('temp') || lower.includes('trash') || lower.includes('disposable') || lower.includes('fake') || lower.includes('spam')) {
    return { score: 65, badge: 'Standard', isLegitCorporate: false };
  }
  
  if (tld === 'com') {
    if (lower.includes('tech') || lower.includes('systems') || lower.includes('group') || lower.includes('construction') || lower.includes('consulting') || lower.includes('istanbul') || lower.includes('corp')) {
      return { score: 99, badge: 'Enterprise .COM', isLegitCorporate: true };
    }
    return { score: 96, badge: 'Verified .COM', isLegitCorporate: true };
  }
  
  if (tld === 'net' || tld === 'org') {
    return { score: 92, badge: 'Clean Tier', isLegitCorporate: true };
  }
  
  return { score: 88, badge: 'Standard Tier', isLegitCorporate: false };
}

async function fetchAllDomains() {
  const now = Date.now();
  if (domainsCache.data.length > 0 && now - domainsCache.lastUpdated < 180000) {
    return domainsCache.data;
  }

  const combined = [];
  
  try {
    const res = await fetch(`${PROVIDER_URLS.mailgw}/domains`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const members = data['hydra:member'] || [];
      members.forEach((d) => {
        if (d.isActive && d.domain) {
          const { score, badge, isLegitCorporate } = calculateStealthScore(d.domain);
          combined.push({
            id: d.id,
            domain: d.domain,
            provider: 'mailgw',
            apiUrl: PROVIDER_URLS.mailgw,
            isActive: d.isActive,
            stealthScore: score,
            badge: badge,
            isLegitCorporate: isLegitCorporate,
            type: 'Primary Enterprise',
          });
        }
      });
    }
  } catch (err) {
    console.warn('Failed to fetch Mail.gw domains:', err.message);
  }

  try {
    const res = await fetch(`${PROVIDER_URLS.mailtm}/domains`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const members = data['hydra:member'] || [];
      members.forEach((d) => {
        if (d.isActive && d.domain) {
          if (!combined.some((item) => item.domain.toLowerCase() === d.domain.toLowerCase())) {
            const { score, badge, isLegitCorporate } = calculateStealthScore(d.domain);
            combined.push({
              id: d.id,
              domain: d.domain,
              provider: 'mailtm',
              apiUrl: PROVIDER_URLS.mailtm,
              isActive: d.isActive,
              stealthScore: score,
              badge: badge,
              isLegitCorporate: isLegitCorporate,
              type: 'Backup High-Delivery',
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn('Failed to fetch Mail.tm domains:', err.message);
  }

  if (combined.length === 0) {
    const fallbacks = [
      { domain: 'oakon.com', provider: 'mailgw', stealthScore: 98, badge: 'Enterprise .COM' },
      { domain: 'raleigh-construction.com', provider: 'mailgw', stealthScore: 99, badge: 'Enterprise .COM' },
      { domain: 'questtechsystems.com', provider: 'mailgw', stealthScore: 99, badge: 'Enterprise .COM' },
      { domain: 'pastryofistanbul.com', provider: 'mailgw', stealthScore: 97, badge: 'Enterprise .COM' },
      { domain: 'teihu.com', provider: 'mailgw', stealthScore: 95, badge: 'Verified .COM' },
      { domain: 'emalupe.com', provider: 'mailtm', stealthScore: 94, badge: 'Verified .COM' },
    ];
    fallbacks.forEach((f) => {
      combined.push({
        id: f.domain,
        domain: f.domain,
        provider: f.provider,
        apiUrl: PROVIDER_URLS[f.provider],
        isActive: true,
        stealthScore: f.stealthScore,
        badge: f.badge,
        isLegitCorporate: true,
        type: 'Primary Enterprise',
      });
    });
  }

  combined.sort((a, b) => b.stealthScore - a.stealthScore);

  domainsCache = {
    data: combined,
    lastUpdated: now,
  };

  return combined;
}

// 1. Get available active domains
app.get('/api/domains', async (req, res) => {
  try {
    const domains = await fetchAllDomains();
    res.json({ success: true, count: domains.length, domains });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve domain list' });
  }
});

// 2. Create a new mailbox account
app.post('/api/mailbox/create', async (req, res) => {
  try {
    let { address, password, provider } = req.body;
    const domains = await fetchAllDomains();
    
    if (!address) {
      const selectedDomainObj = domains[Math.floor(Math.random() * Math.min(domains.length, 5))] || domains[0];
      const randomPrefix = 'user_' + Math.random().toString(36).substring(2, 9);
      address = `${randomPrefix}@${selectedDomainObj.domain}`;
      provider = selectedDomainObj.provider;
    } else {
      const domainPart = address.split('@')[1];
      const matchedDomain = domains.find((d) => d.domain.toLowerCase() === (domainPart || '').toLowerCase());
      provider = matchedDomain ? matchedDomain.provider : (provider || 'mailgw');
    }

    if (!password) {
      password = 'TempMail#' + Math.random().toString(36).substring(2, 10) + 'X!';
    }

    const apiUrl = PROVIDER_URLS[provider] || PROVIDER_URLS.mailgw;

    const regRes = await fetch(`${apiUrl}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });

    let regData = {};
    if (regRes.ok) {
      regData = await regRes.json();
    }

    const authRes = await fetch(`${apiUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    });

    if (!authRes.ok) {
      const authErr = await authRes.text();
      return res.status(authRes.status).json({ success: false, error: 'Failed to authenticate mailbox.', details: authErr });
    }

    const authData = await authRes.json();

    res.json({
      success: true,
      mailbox: {
        id: regData.id || authData.id,
        address: address,
        password: password,
        token: authData.token,
        provider: provider,
        createdAt: regData.createdAt || new Date().toISOString(),
        retentionAt: regData.retentionAt || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Messages List
app.get('/api/mailbox/messages', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const provider = req.headers['x-provider'] || 'mailgw';
    const apiUrl = PROVIDER_URLS[provider] || PROVIDER_URLS.mailgw;

    if (!authHeader) return res.status(401).json({ success: false, error: 'Authorization required' });

    const msgRes = await fetch(`${apiUrl}/messages?page=1`, {
      headers: { Authorization: authHeader },
    });

    if (!msgRes.ok) return res.status(msgRes.status).json({ success: false, error: 'Failed to fetch messages' });

    const data = await msgRes.json();
    const rawMessages = data['hydra:member'] || [];

    res.json({
      success: true,
      total: data['hydra:totalItems'] || rawMessages.length,
      messages: rawMessages.map((msg) => ({
        id: msg.id,
        msgId: msg.msgid,
        from: msg.from,
        to: msg.to,
        subject: msg.subject || '(No Subject)',
        intro: msg.intro || '',
        seen: msg.seen,
        isDeleted: msg.isDeleted,
        hasAttachments: msg.hasAttachments,
        size: msg.size,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Single Message
app.get('/api/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const provider = req.headers['x-provider'] || 'mailgw';
    const apiUrl = PROVIDER_URLS[provider] || PROVIDER_URLS.mailgw;

    if (!authHeader) return res.status(401).json({ success: false, error: 'Authorization required' });

    const msgRes = await fetch(`${apiUrl}/messages/${id}`, {
      headers: { Authorization: authHeader },
    });

    if (!msgRes.ok) return res.status(msgRes.status).json({ success: false, error: 'Failed to fetch message' });

    const message = await msgRes.json();
    res.json({
      success: true,
      message: {
        id: message.id,
        msgId: message.msgid,
        from: message.from,
        to: message.to,
        subject: message.subject || '(No Subject)',
        intro: message.intro,
        seen: message.seen,
        hasAttachments: message.hasAttachments,
        size: message.size,
        createdAt: message.createdAt,
        text: message.text || '',
        html: message.html ? (Array.isArray(message.html) ? message.html.join('') : message.html) : '',
        attachments: message.attachments || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Attachment Download Proxy
app.get('/api/mailbox/attachment', async (req, res) => {
  try {
    const { url, filename } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'Missing url' });

    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ success: false, error: 'Download failed' });

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    if (filename) res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Delete Message
app.delete('/api/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const provider = req.headers['x-provider'] || 'mailgw';
    const apiUrl = PROVIDER_URLS[provider] || PROVIDER_URLS.mailgw;

    if (!authHeader) return res.status(401).json({ success: false, error: 'Authorization required' });

    await fetch(`${apiUrl}/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Health Check
app.get('/api/health', async (req, res) => {
  const domains = await fetchAllDomains();
  res.json({
    status: 'online',
    service: 'TempMail Pro Serverless Gateway',
    timestamp: new Date().toISOString(),
    activeDomains: domains.length,
    providers: ['Mail.gw (Enterprise .COM)', 'Mail.tm (High Delivery)'],
  });
});

module.exports = app;
