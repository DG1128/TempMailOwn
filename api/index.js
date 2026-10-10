const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory simulation message store
const simulatedMessagesStore = new Map();

// Provider URLs
const PROVIDERS = {
  tempmail_io: {
    name: 'TempMail.io High-Speed CDN',
    apiUrl: 'https://api.internal.temp-mail.io/api/v3',
    region: '🇺🇸 US / 🇪🇺 EU High Speed',
    type: 'CDN Edge',
  },
  mailtm: {
    name: 'Mail.tm Enterprise Hydra',
    apiUrl: 'https://api.mail.tm',
    region: '🇩🇪 Global Edge',
    type: 'Enterprise Token',
  },
  guerrillamail: {
    name: 'Guerrilla Mail (18-Yr Infallible)',
    apiUrl: 'https://api.guerrillamail.com/ajax.php',
    region: '🛡️ Global Resilient',
    type: 'Infallible Veteran',
  },
  mailgw: {
    name: 'Mail.gw Gateway',
    apiUrl: 'https://api.mail.gw',
    region: '🌐 Secondary Fallback',
    type: 'Secondary Failover',
  },
};

const GUERRILLA_DOMAINS = [
  'sharklasers.com',
  'guerrillamail.info',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'pokemail.net',
];

let domainsCache = {
  data: [],
  lastUpdated: 0,
};

let providerHealthCache = {
  data: {},
  lastChecked: 0,
};

function calculateStealthScore(domain, providerKey) {
  const lower = (domain || '').toLowerCase();
  const tld = lower.split('.').pop();

  if (providerKey === 'guerrillamail') {
    if (lower === 'sharklasers.com') {
      return { score: 98, badge: 'Popular .COM', isLegitCorporate: true, region: '🇺🇸 North America' };
    }
    if (tld === 'com') {
      return { score: 97, badge: 'Veteran .COM', isLegitCorporate: true, region: '🌐 Global' };
    }
    return { score: 94, badge: 'Resilient Tier', isLegitCorporate: false, region: '🛡️ Infallible Shield' };
  }

  if (tld === 'com') {
    if (
      lower.includes('tech') ||
      lower.includes('systems') ||
      lower.includes('group') ||
      lower.includes('corp') ||
      lower.includes('space') ||
      lower.includes('app')
    ) {
      return { score: 99, badge: 'Enterprise .COM', isLegitCorporate: true, region: '🇺🇸 US CDN' };
    }
    return { score: 97, badge: 'Verified .COM', isLegitCorporate: true, region: '🇺🇸 US / 🇪🇺 EU' };
  }

  if (tld === 'net' || tld === 'org') {
    return { score: 92, badge: 'Clean Tier', isLegitCorporate: true, region: '🇪🇺 Europe' };
  }

  return { score: 89, badge: 'Standard Tier', isLegitCorporate: false, region: '⚡ Global CDN' };
}

async function fetchAllGlobalDomains() {
  const now = Date.now();
  if (domainsCache.data.length > 0 && now - domainsCache.lastUpdated < 180000) {
    return domainsCache.data;
  }

  const combined = [];
  const domainSet = new Set();

  const addDomain = (domain, provider, providerName, extra = {}) => {
    const dLower = (domain || '').toLowerCase().trim();
    if (!dLower || domainSet.has(dLower)) return;
    domainSet.add(dLower);

    const { score, badge, isLegitCorporate, region } = calculateStealthScore(dLower, provider);
    combined.push({
      id: `${provider}_${dLower}`,
      domain: dLower,
      provider: provider,
      providerName: providerName,
      stealthScore: extra.score || score,
      badge: extra.badge || badge,
      isLegitCorporate: extra.isLegitCorporate ?? isLegitCorporate,
      region: extra.region || region,
      isActive: true,
    });
  };

  try {
    const res = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/domains`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.domains)) {
        data.domains.forEach((d) => {
          if (d.name) {
            addDomain(d.name, 'tempmail_io', 'TempMail CDN', {
              region: '🇺🇸 US / 🇪🇺 EU High Speed',
            });
          }
        });
      }
    }
  } catch (err) {}

  try {
    const res = await fetch(`${PROVIDERS.mailtm.apiUrl}/domains`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4500),
    });
    if (res.ok) {
      const data = await res.json();
      const members = data['hydra:member'] || [];
      members.forEach((d) => {
        if (d.isActive && d.domain) {
          addDomain(d.domain, 'mailtm', 'Mail.tm Enterprise', {
            region: '🇩🇪 Global Cloudflare',
            badge: 'Enterprise .COM',
            score: 99,
          });
        }
      });
    }
  } catch (err) {}

  GUERRILLA_DOMAINS.forEach((gDomain) => {
    addDomain(gDomain, 'guerrillamail', 'Guerrilla Armor', {
      region: '🛡️ 18-Yr Infallible',
    });
  });

  if (combined.length === 0) {
    const staticFallbacks = [
      { domain: 'ruutukf.com', provider: 'tempmail_io', score: 98, badge: 'Verified .COM' },
      { domain: 'yzcalo.com', provider: 'tempmail_io', score: 97, badge: 'Verified .COM' },
      { domain: 'maxxspace.com', provider: 'mailtm', score: 99, badge: 'Enterprise .COM' },
      { domain: 'sharklasers.com', provider: 'guerrillamail', score: 98, badge: 'Popular .COM' },
      { domain: 'guerrillamail.com', provider: 'guerrillamail', score: 96, badge: 'Veteran .COM' },
      { domain: 'grr.la', provider: 'guerrillamail', score: 94, badge: 'Clean Tier' },
    ];
    staticFallbacks.forEach((f) => {
      addDomain(f.domain, f.provider, PROVIDERS[f.provider]?.name || 'Global Provider', {
        score: f.score,
        badge: f.badge,
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

async function checkProviderHealth() {
  const now = Date.now();
  if (now - providerHealthCache.lastChecked < 60000 && Object.keys(providerHealthCache.data).length > 0) {
    return providerHealthCache.data;
  }

  const results = {};

  try {
    const t0 = Date.now();
    const res = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/domains`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3500),
    });
    results.tempmail_io = {
      name: 'TempMail.io CDN',
      region: '🇺🇸 US / 🇪🇺 EU',
      status: res.ok ? 'online' : 'degraded',
      latency: Date.now() - t0,
      domainCount: 7,
    };
  } catch (e) {
    results.tempmail_io = { name: 'TempMail.io CDN', region: '🇺🇸 US / 🇪🇺 EU', status: 'offline', latency: null, domainCount: 0 };
  }

  try {
    const t0 = Date.now();
    const res = await fetch(`${PROVIDERS.mailtm.apiUrl}/domains`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3500),
    });
    results.mailtm = {
      name: 'Mail.tm Enterprise',
      region: '🇩🇪 Cloudflare Edge',
      status: res.ok ? 'online' : 'degraded',
      latency: Date.now() - t0,
      domainCount: 1,
    };
  } catch (e) {
    results.mailtm = { name: 'Mail.tm Enterprise', region: '🇩🇪 Cloudflare Edge', status: 'offline', latency: null, domainCount: 0 };
  }

  try {
    const t0 = Date.now();
    const res = await fetch(`${PROVIDERS.guerrillamail.apiUrl}?f=get_email_address`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3500),
    });
    results.guerrillamail = {
      name: 'Guerrilla Mail (18y Veteran)',
      region: '🛡️ Infallible Global',
      status: res.ok ? 'online' : 'degraded',
      latency: Date.now() - t0,
      domainCount: GUERRILLA_DOMAINS.length,
    };
  } catch (e) {
    results.guerrillamail = { name: 'Guerrilla Mail (18y Veteran)', region: '🛡️ Infallible Global', status: 'offline', latency: null, domainCount: 0 };
  }

  providerHealthCache = {
    data: results,
    lastChecked: now,
  };

  return results;
}

async function getOrRenewGuerrillaSession(prefix, existingSid) {
  if (existingSid) {
    try {
      const testRes = await fetch(
        `${PROVIDERS.guerrillamail.apiUrl}?f=check_email&seq=0&sid_token=${encodeURIComponent(existingSid)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
      );
      if (testRes.ok) {
        const testData = await testRes.json();
        if (!testData.error) {
          return { sidToken: existingSid, email: testData.email };
        }
      }
    } catch (e) {}
  }

  try {
    const initRes = await fetch(`${PROVIDERS.guerrillamail.apiUrl}?f=get_email_address`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (initRes.ok) {
      const initData = await initRes.json();
      const newSid = initData.sid_token;
      if (prefix) {
        const setRes = await fetch(
          `${PROVIDERS.guerrillamail.apiUrl}?f=set_email_user&email_user=${encodeURIComponent(prefix)}&lang=en&sid_token=${encodeURIComponent(newSid)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
        );
        if (setRes.ok) {
          const setData = await setRes.json();
          return { sidToken: newSid, email: setData.email_addr || initData.email_addr };
        }
      }
      return { sidToken: newSid, email: initData.email_addr };
    }
  } catch (err) {}
  return { sidToken: existingSid || 'gm_' + Date.now(), email: '' };
}

app.get('/api/domains', async (req, res) => {
  try {
    const domains = await fetchAllGlobalDomains();
    res.json({ success: true, count: domains.length, domains: domains });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve domain list' });
  }
});

app.get('/api/providers/status', async (req, res) => {
  try {
    const health = await checkProviderHealth();
    res.json({ success: true, timestamp: new Date().toISOString(), providers: health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mailbox/create', async (req, res) => {
  let { address, password, provider, domain } = req.body;
  const domains = await fetchAllGlobalDomains();

  if (domain) {
    const domainMatch = domains.find((d) => d.domain.toLowerCase() === domain.toLowerCase());
    if (domainMatch) {
      provider = domainMatch.provider;
    } else if (GUERRILLA_DOMAINS.includes(domain.toLowerCase())) {
      provider = 'guerrillamail';
    }
  }

  if (address && address.includes('@')) {
    const extractedDomain = address.split('@')[1].toLowerCase();
    domain = extractedDomain;
    const domainMatch = domains.find((d) => d.domain.toLowerCase() === extractedDomain);
    if (domainMatch) {
      provider = domainMatch.provider;
    } else if (GUERRILLA_DOMAINS.includes(extractedDomain)) {
      provider = 'guerrillamail';
    }
  }

  if (!address && !domain) {
    const topDomain = domains[Math.floor(Math.random() * Math.min(domains.length, 6))] || domains[0];
    domain = topDomain?.domain || 'ruutukf.com';
    provider = topDomain?.provider || 'tempmail_io';
  }

  if (!provider) provider = 'tempmail_io';

  let prefix = address ? address.split('@')[0] : '';
  if (!prefix) prefix = 'user_' + Math.random().toString(36).substring(2, 9);
  prefix = prefix.toLowerCase().replace(/[^a-z0-9._-]/g, '');

  if (!password) password = 'Vault#' + Math.random().toString(36).substring(2, 10) + 'X9!';

  const providerCascade = [provider, 'tempmail_io', 'guerrillamail', 'mailtm'].filter((v, i, a) => a.indexOf(v) === i);

  for (const currentProvider of providerCascade) {
    try {
      if (currentProvider === 'tempmail_io') {
        const tmDomains = domains.filter((d) => d.provider === 'tempmail_io');
        const targetDomain = tmDomains.some((d) => d.domain === domain) ? domain : tmDomains[0]?.domain || 'ruutukf.com';

        const createRes = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/new`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          body: JSON.stringify({ name: prefix, domain: targetDomain }),
          signal: AbortSignal.timeout(6000),
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          return res.json({
            success: true,
            mailbox: {
              id: 'tmio_' + Date.now(),
              address: createData.email,
              provider: 'tempmail_io',
              token: createData.token,
              password: password,
              createdAt: new Date().toISOString(),
            },
          });
        }
      }

      if (currentProvider === 'guerrillamail') {
        const initRes = await fetch(`${PROVIDERS.guerrillamail.apiUrl}?f=get_email_address`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000),
        });

        if (initRes.ok) {
          const initData = await initRes.json();
          const sidToken = initData.sid_token;
          let targetGuerrillaDomain = 'sharklasers.com';
          if (domain && GUERRILLA_DOMAINS.includes(domain.toLowerCase())) {
            targetGuerrillaDomain = domain.toLowerCase();
          }
          let finalAddress = `${prefix}@${targetGuerrillaDomain}`;

          try {
            const setRes = await fetch(
              `${PROVIDERS.guerrillamail.apiUrl}?f=set_email_user&email_user=${encodeURIComponent(prefix)}&lang=en&sid_token=${encodeURIComponent(sidToken)}`,
              { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) }
            );
            if (setRes.ok) {
              const setData = await setRes.json();
              if (setData.email_addr) finalAddress = `${prefix}@${targetGuerrillaDomain}`;
            }
          } catch (e) {}

          return res.json({
            success: true,
            mailbox: {
              id: 'gm_' + sidToken,
              address: finalAddress,
              provider: 'guerrillamail',
              token: sidToken,
              sidToken: sidToken,
              password: password,
              createdAt: new Date().toISOString(),
            },
          });
        }
      }

      if (currentProvider === 'mailtm') {
        const mtmDomains = domains.filter((d) => d.provider === 'mailtm');
        const targetDomain = mtmDomains.some((d) => d.domain === domain) ? domain : mtmDomains[0]?.domain || 'maxxspace.com';
        const targetAddress = `${prefix}@${targetDomain}`;

        const regRes = await fetch(`${PROVIDERS.mailtm.apiUrl}/accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          body: JSON.stringify({ address: targetAddress, password: password }),
          signal: AbortSignal.timeout(6000),
        });

        let regData = {};
        if (regRes.ok) regData = await regRes.json();

        const authRes = await fetch(`${PROVIDERS.mailtm.apiUrl}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          body: JSON.stringify({ address: targetAddress, password: password }),
          signal: AbortSignal.timeout(6000),
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          return res.json({
            success: true,
            mailbox: {
              id: regData.id || authData.id,
              address: targetAddress,
              provider: 'mailtm',
              token: authData.token,
              password: password,
              createdAt: regData.createdAt || new Date().toISOString(),
            },
          });
        }
      }
    } catch (err) {}
  }

  const fallbackAddress = `${prefix}@sharklasers.com`;
  return res.json({
    success: true,
    mailbox: {
      id: 'local_' + Date.now(),
      address: fallbackAddress,
      provider: 'guerrillamail',
      token: 'local_token_' + Date.now(),
      password: password,
      createdAt: new Date().toISOString(),
    },
  });
});

app.post('/api/mailbox/login', async (req, res) => {
  try {
    const { address, password, provider = 'tempmail_io', token, sidToken } = req.body;
    if (!address) return res.status(400).json({ success: false, error: 'Address required' });

    if (provider === 'mailtm') {
      const authRes = await fetch(`${PROVIDERS.mailtm.apiUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      if (!authRes.ok) return res.status(authRes.status).json({ success: false, error: 'Invalid password' });
      const authData = await authRes.json();
      return res.json({ success: true, token: authData.token, id: authData.id, address, provider });
    }

    return res.json({
      success: true,
      token: token || sidToken || 'session_' + Date.now(),
      sidToken: sidToken || token,
      address,
      provider,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mailbox/messages', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    let provider = req.headers['x-provider'] || 'tempmail_io';
    const address = (req.headers['x-address'] || '').toLowerCase();
    let sidToken = req.headers['x-sid-token'] || authHeader.replace(/^Bearer\s+/i, '');
    let token = authHeader.replace(/^Bearer\s+/i, '');

    if (address && address.includes('@')) {
      const addrDomain = address.split('@')[1];
      if (GUERRILLA_DOMAINS.includes(addrDomain)) {
        provider = 'guerrillamail';
      }
    }

    let normalizedMessages = [];
    let refreshedSidToken = null;

    if (address && simulatedMessagesStore.has(address)) {
      normalizedMessages.push(...simulatedMessagesStore.get(address));
    }

    if (provider === 'tempmail_io' && address) {
      let msgRes = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/${encodeURIComponent(address)}/messages`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });

      if (msgRes.status === 400 && address.includes('@')) {
        const [prefix, dom] = address.split('@');
        try {
          await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
            body: JSON.stringify({ name: prefix, domain: dom }),
            signal: AbortSignal.timeout(5000),
          });
          msgRes = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/${encodeURIComponent(address)}/messages`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000),
          });
        } catch (e) {}
      }

      if (msgRes.ok) {
        const list = await msgRes.json();
        if (Array.isArray(list)) {
          list.forEach((m) => {
            normalizedMessages.push({
              id: m.id,
              msgId: m.id,
              from: {
                name: m.from ? m.from.split('<')[0].trim() : 'Unknown Sender',
                address: m.from || 'unknown@domain.com',
              },
              to: [{ address: address, name: 'You' }],
              subject: m.subject || '(No Subject)',
              intro: m.body_text ? m.body_text.substring(0, 140) : '',
              seen: false,
              isDeleted: false,
              hasAttachments: Boolean(m.attachments && m.attachments.length > 0),
              attachments: m.attachments || [],
              text: m.body_text || '',
              html: m.body_html || '',
              createdAt: m.created_at || new Date().toISOString(),
            });
          });
        }
      }
    } else if (provider === 'guerrillamail') {
      const prefix = address ? address.split('@')[0] : '';
      let activeSid = sidToken;
      let checkData = null;

      if (activeSid && !activeSid.startsWith('local_token_')) {
        try {
          const checkRes = await fetch(
            `${PROVIDERS.guerrillamail.apiUrl}?f=check_email&seq=0&sid_token=${encodeURIComponent(activeSid)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }
          );
          if (checkRes.ok) checkData = await checkRes.json();
        } catch (e) {}
      }

      if (!checkData || checkData.error || !checkData.list) {
        const renewed = await getOrRenewGuerrillaSession(prefix, activeSid);
        activeSid = renewed.sidToken;
        refreshedSidToken = renewed.sidToken;
        try {
          const retryRes = await fetch(
            `${PROVIDERS.guerrillamail.apiUrl}?f=check_email&seq=0&sid_token=${encodeURIComponent(activeSid)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }
          );
          if (retryRes.ok) checkData = await retryRes.json();
        } catch (e) {}
      }

      if (checkData && Array.isArray(checkData.list)) {
        checkData.list.forEach((m) => {
          normalizedMessages.push({
            id: m.mail_id,
            msgId: m.mail_id,
            from: {
              name: m.mail_from ? m.mail_from.split('@')[0] : 'Sender',
              address: m.mail_from || '',
            },
            to: [{ address: address || m.mail_recipient, name: 'You' }],
            subject: m.mail_subject || '(No Subject)',
            intro: m.mail_excerpt || '',
            seen: Boolean(m.mail_read),
            isDeleted: false,
            hasAttachments: Boolean(m.att && Number(m.att) > 0),
            createdAt: m.mail_date || new Date().toISOString(),
            text: m.mail_body || m.mail_excerpt || '',
            html: m.mail_body || '',
            sidToken: activeSid,
          });
        });
      }
    } else if ((provider === 'mailtm' || provider === 'mailgw') && token && token.startsWith('eyJ')) {
      const apiUrl = PROVIDERS[provider]?.apiUrl || PROVIDERS.mailtm.apiUrl;
      const msgRes = await fetch(`${apiUrl}/messages?page=1`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (msgRes.ok) {
        const data = await msgRes.json();
        const raw = data['hydra:member'] || [];
        raw.forEach((m) => {
          normalizedMessages.push({
            id: m.id,
            msgId: m.msgid,
            from: m.from || { name: 'Sender', address: '' },
            to: m.to || [{ address: address, name: 'You' }],
            subject: m.subject || '(No Subject)',
            intro: m.intro || '',
            seen: m.seen,
            isDeleted: m.isDeleted,
            hasAttachments: m.hasAttachments,
            size: m.size,
            createdAt: m.createdAt,
          });
        });
      }
    }

    normalizedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (refreshedSidToken) res.setHeader('x-refreshed-sid-token', refreshedSidToken);

    res.json({
      success: true,
      total: normalizedMessages.length,
      messages: normalizedMessages,
      refreshedSidToken: refreshedSidToken || undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization || '';
    let provider = req.headers['x-provider'] || 'tempmail_io';
    const address = (req.headers['x-address'] || '').toLowerCase();
    let sidToken = req.headers['x-sid-token'] || authHeader.replace(/^Bearer\s+/i, '');
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (address && address.includes('@')) {
      const addrDomain = address.split('@')[1];
      if (GUERRILLA_DOMAINS.includes(addrDomain)) {
        provider = 'guerrillamail';
      }
    }

    if (address && simulatedMessagesStore.has(address)) {
      const localMsg = simulatedMessagesStore.get(address).find((m) => String(m.id) === String(id));
      if (localMsg) {
        localMsg.seen = true;
        return res.json({ success: true, message: localMsg });
      }
    }

    if (provider === 'tempmail_io' && address) {
      const msgRes = await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/${encodeURIComponent(address)}/messages`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (msgRes.ok) {
        const list = await msgRes.json();
        const target = (list || []).find((m) => String(m.id) === String(id));
        if (target) {
          return res.json({
            success: true,
            message: {
              id: target.id,
              msgId: target.id,
              from: { name: target.from ? target.from.split('<')[0].trim() : 'Sender', address: target.from || '' },
              to: [{ address: address, name: 'You' }],
              subject: target.subject || '(No Subject)',
              intro: target.body_text ? target.body_text.substring(0, 140) : '',
              seen: true,
              isDeleted: false,
              hasAttachments: Boolean(target.attachments && target.attachments.length > 0),
              attachments: target.attachments || [],
              text: target.body_text || '',
              html: target.body_html || '',
              createdAt: target.created_at || new Date().toISOString(),
            },
          });
        }
      }
    }

    if (provider === 'guerrillamail') {
      let activeSid = sidToken;
      const prefix = address ? address.split('@')[0] : '';
      if (!activeSid || activeSid.startsWith('local_token_')) {
        const renewed = await getOrRenewGuerrillaSession(prefix, activeSid);
        activeSid = renewed.sidToken;
      }

      let fetchRes = await fetch(
        `${PROVIDERS.guerrillamail.apiUrl}?f=fetch_email&email_id=${encodeURIComponent(id)}&sid_token=${encodeURIComponent(activeSid)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
      );

      if (!fetchRes.ok) {
        const renewed = await getOrRenewGuerrillaSession(prefix, activeSid);
        activeSid = renewed.sidToken;
        fetchRes = await fetch(
          `${PROVIDERS.guerrillamail.apiUrl}?f=fetch_email&email_id=${encodeURIComponent(id)}&sid_token=${encodeURIComponent(activeSid)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
        );
      }

      if (fetchRes.ok) {
        const m = await fetchRes.json();
        if (!m.error) {
          return res.json({
            success: true,
            message: {
              id: m.mail_id,
              msgId: m.mail_id,
              from: { name: m.mail_from ? m.mail_from.split('@')[0] : 'Sender', address: m.mail_from || '' },
              to: [{ address: address || m.mail_recipient, name: 'You' }],
              subject: m.mail_subject || '(No Subject)',
              intro: m.mail_excerpt || '',
              seen: true,
              isDeleted: false,
              hasAttachments: Boolean(m.att && Number(m.att) > 0),
              attachments: [],
              text: m.mail_body ? m.mail_body.replace(/<[^>]+>/g, '') : '',
              html: m.mail_body || '',
              createdAt: m.mail_date || new Date().toISOString(),
            },
          });
        }
      }
    }

    if (provider === 'mailtm' || provider === 'mailgw') {
      const apiUrl = PROVIDERS[provider]?.apiUrl || PROVIDERS.mailtm.apiUrl;
      const msgRes = await fetch(`${apiUrl}/messages/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (msgRes.ok) {
        const m = await msgRes.json();
        return res.json({
          success: true,
          message: {
            id: m.id,
            msgId: m.msgid,
            from: m.from || { name: 'Sender', address: '' },
            to: m.to || [{ address: address, name: 'You' }],
            cc: m.cc || [],
            bcc: m.bcc || [],
            subject: m.subject || '(No Subject)',
            intro: m.intro || '',
            seen: true,
            isDeleted: m.isDeleted,
            hasAttachments: m.hasAttachments,
            size: m.size,
            downloadUrl: m.downloadUrl,
            createdAt: m.createdAt,
            text: m.text || '',
            html: m.html ? (Array.isArray(m.html) ? m.html.join('') : m.html) : '',
            attachments: m.attachments || [],
          },
        });
      }
    }

    return res.status(404).json({ success: false, error: 'Email not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mailbox/attachment', async (req, res) => {
  try {
    let { url, filename = 'attachment', token } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'Missing attachment URL' });

    if (url.startsWith('/')) {
      url = `${PROVIDERS.mailtm.apiUrl}${url}`;
    }

    const authHeader = req.headers.authorization || (token ? `Bearer ${token}` : '');
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    if (authHeader) headers.Authorization = authHeader;

    const upstreamRes = await fetch(url, { headers });
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ success: false, error: 'Failed to download attachment' });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/mailbox/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization || '';
    const provider = req.headers['x-provider'] || 'tempmail_io';
    const address = (req.headers['x-address'] || '').toLowerCase();
    const sidToken = req.headers['x-sid-token'] || authHeader.replace(/^Bearer\s+/i, '');
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (address && simulatedMessagesStore.has(address)) {
      const list = simulatedMessagesStore.get(address);
      simulatedMessagesStore.set(address, list.filter((m) => String(m.id) !== String(id)));
    }

    if (provider === 'guerrillamail' && sidToken) {
      await fetch(
        `${PROVIDERS.guerrillamail.apiUrl}?f=del_email&email_ids[]=${encodeURIComponent(id)}&sid_token=${encodeURIComponent(sidToken)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      ).catch(() => {});
    } else if ((provider === 'mailtm' || provider === 'mailgw') && token) {
      const apiUrl = PROVIDERS[provider]?.apiUrl || PROVIDERS.mailtm.apiUrl;
      await fetch(`${apiUrl}/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/mailbox/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization || '';
    const provider = req.headers['x-provider'] || 'tempmail_io';
    const address = (req.headers['x-address'] || '').toLowerCase();
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (address && simulatedMessagesStore.has(address)) {
      simulatedMessagesStore.delete(address);
    }

    if (provider === 'tempmail_io' && address && token) {
      await fetch(`${PROVIDERS.tempmail_io.apiUrl}/email/${encodeURIComponent(address)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      }).catch(() => {});
    } else if ((provider === 'mailtm' || provider === 'mailgw') && token) {
      const apiUrl = PROVIDERS[provider]?.apiUrl || PROVIDERS.mailtm.apiUrl;
      await fetch(`${apiUrl}/accounts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    res.json({ success: true, message: 'Mailbox destroyed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mailbox/simulate-email', (req, res) => {
  const { address, senderType = 'auth' } = req.body;
  if (!address) return res.status(400).json({ success: false, error: 'Target email address required' });

  const normalizedAddress = address.toLowerCase();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const timeStr = new Date().toLocaleTimeString();

  const senders = {
    auth: {
      name: 'GitHub Security',
      from: 'no-reply@github.com',
      subject: `[GitHub] Please verify your one-time code: ${otpCode}`,
      title: 'GitHub Two-Factor Authentication',
      desc: 'You recently initiated a sign-in or authorization request. Enter the single-use passcode below to continue.',
      btnText: 'Review Recent Activity',
    },
    google: {
      name: 'Google Accounts',
      from: 'no-reply@accounts.google.com',
      subject: `Google verification code: ${otpCode}`,
      title: 'Confirm your recovery email',
      desc: 'Google received a request to use this email address. Your confirmation pin is ready.',
      btnText: 'Manage Security',
    },
    discord: {
      name: 'Discord Verification',
      from: 'notifications@discordapp.com',
      subject: `Your Discord Security PIN is ${otpCode}`,
      title: 'Verify Your Discord Account',
      desc: 'Someone is attempting to log in to your account from a new location. Confirm it is you.',
      btnText: 'Verify Login',
    },
  };

  const selected = senders[senderType] || senders.auth;

  const simulatedMsg = {
    id: 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    msgId: `<sim-${Date.now()}@tempmailpro.io>`,
    from: { name: selected.name, address: selected.from },
    to: [{ name: 'You', address: normalizedAddress }],
    subject: selected.subject,
    intro: `Your verification code is ${otpCode}. Valid for 10 minutes.`,
    seen: false,
    isDeleted: false,
    hasAttachments: false,
    attachments: [],
    createdAt: new Date().toISOString(),
    text: `Hello,\n\n${selected.title}\n${selected.desc}\n\nVERIFICATION CODE: ${otpCode}\n\nGenerated at: ${timeStr}\nIf you did not request this code, no action is needed.\n\nBest regards,\n${selected.name} Team`,
    html: `
      <div style="background-color: #0f172a; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">${selected.name}</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0 0; font-size: 13px;">Official Security Notice &bull; Delivered at ${timeStr}</p>
          </div>
          <div style="padding: 28px 24px; color: #e2e8f0;">
            <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #f8fafc;">${selected.title}</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">${selected.desc}</p>
            <div style="background: #0f172a; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">Your One-Time Passcode</span>
              <span style="font-size: 34px; font-weight: 900; letter-spacing: 0.25em; color: #38bdf8; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">This passcode expires in 10 minutes. Never share this code with anyone.</p>
            <div style="text-align: center;">
              <a href="#" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none;">${selected.btnText}</a>
            </div>
          </div>
          <div style="background: #0c1222; padding: 14px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
            Sent to ${normalizedAddress} &bull; Protected by TempMail Pro Worldwide Gateway
          </div>
        </div>
      </div>
    `,
  };

  if (!simulatedMessagesStore.has(normalizedAddress)) {
    simulatedMessagesStore.set(normalizedAddress, []);
  }
  simulatedMessagesStore.get(normalizedAddress).unshift(simulatedMsg);

  res.json({
    success: true,
    message: 'Test email delivered instantly to active inbox',
    otp: otpCode,
    emailId: simulatedMsg.id,
  });
});

app.get('/api/fake-persona', (req, res) => {
  const firstNames = ['Alexander', 'Marcus', 'Elena', 'Sophia', 'Julian', 'Liam', 'Chloe', 'Adrian', 'Valerie', 'Nathan', 'Ethan', 'Oliver', 'Isabella', 'Charlotte'];
  const lastNames = ['Sterling', 'Vance', 'Cross', 'Mercer', 'Hayden', 'Kensington', 'Sinclair', 'Donovan', 'Chen', 'Bennett', 'Hawthorne', 'Montgomery'];
  const streets = ['442 Montgomery St', '1280 Avenue of the Americas', '855 Market Street', '720 Pinecrest Boulevard', '1900 Silicon Parkway', '500 Tech Vista Lane'];
  const cities = [
    { city: 'San Francisco', state: 'CA', zip: '94104', country: 'United States' },
    { city: 'New York', state: 'NY', zip: '10020', country: 'United States' },
    { city: 'Seattle', state: 'WA', zip: '98101', country: 'United States' },
    { city: 'Austin', state: 'TX', zip: '78701', country: 'United States' },
    { city: 'Chicago', state: 'IL', zip: '60601', country: 'United States' },
    { city: 'Boston', state: 'MA', zip: '02110', country: 'United States' },
  ];
  const companies = ['Apex Cloud Solutions', 'Nexus Cyber Labs', 'Aegis Dynamic Systems', 'Vanguard Data Systems', 'Quantum Crest Tech', 'Vertex Media Labs'];
  const titles = ['Senior Systems Engineer', 'Cloud Infrastructure Architect', 'Product Development Lead', 'Security Analyst', 'Full-Stack Developer', 'DevOps Specialist'];

  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const loc = cities[Math.floor(Math.random() * cities.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const comp = companies[Math.floor(Math.random() * companies.length)];
  const title = titles[Math.floor(Math.random() * titles.length)];
  const phone = `+1 (${Math.floor(200 + Math.random() * 700)}) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    persona: {
      fullName: `${fName} ${lName}`,
      firstName: fName,
      lastName: lName,
      username: `${fName.toLowerCase()}.${lName.toLowerCase()}${Math.floor(Math.random() * 89 + 10)}`,
      phone: phone,
      street: street,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      country: loc.country,
      company: comp,
      jobTitle: title,
      birthDate: `199${Math.floor(Math.random() * 8 + 1)}-0${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 20 + 10)}`,
    },
  });
});

app.get('/api/health', async (req, res) => {
  const domains = await fetchAllGlobalDomains();
  const providers = await checkProviderHealth();
  res.json({
    status: 'online',
    service: 'TempMail Pro Worldwide Multi-Engine Gateway',
    timestamp: new Date().toISOString(),
    totalActiveDomains: domains.length,
    providers: providers,
  });
});

module.exports = app;
