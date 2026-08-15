import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import EmailBar from './components/EmailBar';
import InboxTabs from './components/InboxTabs';
import MessageList from './components/MessageList';
import MessageDetail from './components/MessageDetail';
import VaultModal from './components/VaultModal';
import CustomizeModal from './components/CustomizeModal';
import QRCodeModal from './components/QRCodeModal';
import Toast from './components/Toast';
import { playNewEmailChime, setSoundEnabled } from './utils/audio';

const STORAGE_TABS_KEY = 'tempmail_active_tabs_v2';
const STORAGE_VAULT_KEY = 'tempmail_vault_v2';
const STORAGE_THEME_KEY = 'tempmail_theme_v2';
const STORAGE_SOUND_KEY = 'tempmail_sound_v2';

const POLL_INTERVAL_SECONDS = 10;

export default function App() {
  // Theme & Settings
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem(STORAGE_THEME_KEY) || 'theme-cyber-dark';
  });
  const [soundOn, setSoundOn] = useState(() => {
    return localStorage.getItem(STORAGE_SOUND_KEY) !== 'false';
  });

  // Domains & API state
  const [domains, setDomains] = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(true);

  // Tabs & Mailboxes
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TABS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved tabs from storage');
    }
    return [];
  });
  const [activeTabId, setActiveTabId] = useState(null);

  // Locked Vault items
  const [vaultItems, setVaultItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VAULT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse vault from storage');
    }
    return [];
  });

  // Selected Message & Content
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [fullMessage, setFullMessage] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

  // Modals state
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isCreatingMailbox, setIsCreatingMailbox] = useState(false);

  // Polling timer & refresh
  const [countdownSecs, setCountdownSecs] = useState(POLL_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Refs for timer and current active tab
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;

  // Show a floating toast notification
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Theme to body class
  useEffect(() => {
    document.body.className = currentTheme;
    localStorage.setItem(STORAGE_THEME_KEY, currentTheme);
  }, [currentTheme]);

  // Sync Sound Setting
  useEffect(() => {
    setSoundEnabled(soundOn);
    localStorage.setItem(STORAGE_SOUND_KEY, soundOn.toString());
  }, [soundOn]);

  // Sync Tabs to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem(STORAGE_TABS_KEY, JSON.stringify(tabs));
    }
  }, [tabs]);

  // Sync Vault to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_VAULT_KEY, JSON.stringify(vaultItems));
  }, [vaultItems]);

  // 1. Fetch available domains on load
  useEffect(() => {
    setDomainsLoading(true);
    axios
      .get('/api/domains')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.domains)) {
          setDomains(res.data.domains);
        }
      })
      .catch((err) => {
        console.error('Failed to load domains:', err);
      })
      .finally(() => setDomainsLoading(false));
  }, []);

  // 2. Initialize first mailbox if no tabs exist
  useEffect(() => {
    if (tabs.length === 0) {
      handleCreateMailbox();
    } else if (!activeTabId && tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, []);

  // Create a new mailbox
  const handleCreateMailbox = async (customParams = {}) => {
    setIsCreatingMailbox(true);
    try {
      const res = await axios.post('/api/mailbox/create', {
        address: customParams.address || undefined,
        password: customParams.password || undefined,
        provider: customParams.provider || undefined,
      });

      if (res.data.success && res.data.mailbox) {
        const mb = res.data.mailbox;
        const newTab = {
          id: mb.id || 'tab_' + Date.now(),
          address: mb.address,
          password: mb.password,
          token: mb.token,
          provider: mb.provider,
          createdAt: mb.createdAt,
          isLocked: !!customParams.isLocked,
          note: customParams.note || '',
          messages: [],
          lastChecked: Date.now(),
        };

        setTabs((prev) => {
          // If custom address already open, switch to it
          const existing = prev.find((t) => t.address.toLowerCase() === mb.address.toLowerCase());
          if (existing) {
            return prev.map((t) => (t.id === existing.id ? { ...t, token: mb.token } : t));
          }
          return [...prev, newTab];
        });

        setActiveTabId(newTab.id);

        if (customParams.isLocked) {
          setVaultItems((prev) => {
            if (prev.some((v) => v.address.toLowerCase() === mb.address.toLowerCase())) return prev;
            return [...prev, newTab];
          });
          showToast(`Locked and saved in Vault: ${mb.address}`, 'success');
        } else {
          showToast(`Created stealth address: ${mb.address}`, 'success');
        }

        // Reset countdown
        setCountdownSecs(POLL_INTERVAL_SECONDS);
      }
    } catch (err) {
      console.error('Error creating mailbox:', err);
      showToast(err.response?.data?.error || 'Failed to create mailbox. Please try again.', 'error');
    } finally {
      setIsCreatingMailbox(false);
    }
  };

  // Active Tab object
  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || null;

  // Active Domain Metadata
  const currentDomainName = currentTab?.address?.split('@')[1] || '';
  const domainStealthInfo = domains.find((d) => d.domain.toLowerCase() === currentDomainName.toLowerCase()) || {
    badge: 'Enterprise .COM',
    stealthScore: 99,
  };

  // 3. Poll messages for the active mailbox
  const fetchMessagesForTab = useCallback(async (tab, isSilent = false) => {
    if (!tab || !tab.token) return;

    if (!isSilent) setIsRefreshing(true);

    try {
      const res = await axios.get('/api/mailbox/messages', {
        headers: {
          Authorization: `Bearer ${tab.token}`,
          'x-provider': tab.provider || 'mailgw',
        },
      });

      if (res.data.success && Array.isArray(res.data.messages)) {
        const incoming = res.data.messages;

        // Check if there are new messages not previously in tab
        const prevIds = new Set((tab.messages || []).map((m) => m.id));
        const newUnseen = incoming.filter((m) => !prevIds.has(m.id));

        if (newUnseen.length > 0) {
          playNewEmailChime();
          const firstNew = newUnseen[0];
          showToast(`📧 New email from ${firstNew.from?.name || firstNew.from?.address || 'Sender'}: ${firstNew.subject}`, 'info');

          // Update browser document title
          document.title = `(${newUnseen.length}) New Email - TempMail Pro`;

          // Auto-select latest message if none is open
          if (!selectedMessageId) {
            setSelectedMessageId(firstNew.id);
          }
        }

        // Update tab messages
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tab.id
              ? {
                  ...t,
                  messages: incoming,
                  lastChecked: Date.now(),
                }
              : t
          )
        );
      }
    } catch (err) {
      console.warn(`Error fetching messages for ${tab.address}:`, err.message);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, [selectedMessageId, showToast]);

  // 4. Countdown & Automatic Polling Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSecs((prev) => {
        if (prev <= 1) {
          const active = tabsRef.current.find((t) => t.id === activeTabIdRef.current) || tabsRef.current[0];
          if (active) {
            fetchMessagesForTab(active, true);
          }
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchMessagesForTab]);

  // 5. Fetch Full Message Details when selectedMessageId changes
  useEffect(() => {
    if (!selectedMessageId || !currentTab?.token) {
      setFullMessage(null);
      return;
    }

    setMessageLoading(true);
    axios
      .get(`/api/mailbox/messages/${selectedMessageId}`, {
        headers: {
          Authorization: `Bearer ${currentTab.token}`,
          'x-provider': currentTab.provider || 'mailgw',
        },
      })
      .then((res) => {
        if (res.data.success && res.data.message) {
          setFullMessage(res.data.message);

          // Mark as seen in tab state
          setTabs((prev) =>
            prev.map((t) =>
              t.id === currentTab.id
                ? {
                    ...t,
                    messages: (t.messages || []).map((m) =>
                      m.id === selectedMessageId ? { ...m, seen: true } : m
                    ),
                  }
                : t
            )
          );
        }
      })
      .catch((err) => {
        console.error('Failed to load message detail:', err);
        showToast('Failed to load full message content', 'error');
      })
      .finally(() => setMessageLoading(false));
  }, [selectedMessageId, currentTab?.id, currentTab?.token, currentTab?.provider, showToast]);

  // Reset Document Title when user views message
  useEffect(() => {
    const totalUnread = tabs.reduce((acc, tab) => acc + (tab.messages?.filter((m) => !m.seen)?.length || 0), 0);
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) TempMail Pro`;
    } else {
      document.title = 'TempMail Pro — Fast Disposable Temp Mail with Locked Vault';
    }
  }, [tabs]);

  // Actions
  const handleToggleLock = () => {
    if (!currentTab) return;
    const nextLocked = !currentTab.isLocked;

    setTabs((prev) =>
      prev.map((t) => (t.id === currentTab.id ? { ...t, isLocked: nextLocked } : t))
    );

    if (nextLocked) {
      setVaultItems((prev) => {
        if (prev.some((v) => v.address.toLowerCase() === currentTab.address.toLowerCase())) {
          return prev;
        }
        return [...prev, { ...currentTab, isLocked: true }];
      });
      showToast(`🔒 Mailbox locked! Saved permanently in Vault: ${currentTab.address}`, 'success');
    } else {
      setVaultItems((prev) => prev.filter((v) => v.address.toLowerCase() !== currentTab.address.toLowerCase()));
      showToast(`Unlocked mailbox: ${currentTab.address}`, 'info');
    }
  };

  const handleCloseTab = (tabId) => {
    const tabToClose = tabs.find((t) => t.id === tabId);
    if (tabToClose?.isLocked) {
      showToast(`Closed tab. ${tabToClose.address} remains safely preserved in your Vault!`, 'info');
    }

    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);

    if (activeTabId === tabId && remaining.length > 0) {
      setActiveTabId(remaining[0].id);
      setSelectedMessageId(null);
    }
  };

  const handleAddTab = () => {
    handleCreateMailbox();
  };

  const handleRestoreFromVault = (item) => {
    // Check if already open in tabs
    const existing = tabs.find((t) => t.address.toLowerCase() === item.address.toLowerCase());
    if (existing) {
      setActiveTabId(existing.id);
      showToast(`Switched to active tab: ${item.address}`, 'info');
    } else {
      const restoredTab = {
        ...item,
        id: item.id || 'tab_' + Date.now(),
        isLocked: true,
        messages: item.messages || [],
        lastChecked: Date.now(),
      };
      setTabs((prev) => [...prev, restoredTab]);
      setActiveTabId(restoredTab.id);
      showToast(`Restored ${item.address} into active tab`, 'success');
    }
  };

  const handleRemoveFromVault = (idOrAddr) => {
    setVaultItems((prev) =>
      prev.filter((v) => v.id !== idOrAddr && v.address !== idOrAddr)
    );
    // Also unlock tab if open
    setTabs((prev) =>
      prev.map((t) =>
        t.id === idOrAddr || t.address === idOrAddr ? { ...t, isLocked: false } : t
      )
    );
    showToast('Removed from Vault', 'info');
  };

  const handleUpdateNote = (id, note) => {
    setVaultItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, note } : v))
    );
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, note } : t))
    );
    showToast('Saved note', 'success');
  };

  const handleImportVault = (items) => {
    setVaultItems((prev) => {
      const combined = [...prev];
      items.forEach((newItem) => {
        if (!combined.some((c) => c.address.toLowerCase() === newItem.address.toLowerCase())) {
          combined.push({ ...newItem, isLocked: true });
        }
      });
      return combined;
    });
  };

  const handleDeleteMessage = async (msgId) => {
    if (!currentTab?.token) return;
    try {
      await axios.delete(`/api/mailbox/messages/${msgId}`, {
        headers: {
          Authorization: `Bearer ${currentTab.token}`,
          'x-provider': currentTab.provider || 'mailgw',
        },
      });

      setTabs((prev) =>
        prev.map((t) =>
          t.id === currentTab.id
            ? { ...t, messages: (t.messages || []).filter((m) => m.id !== msgId) }
            : t
        )
      );

      if (selectedMessageId === msgId) {
        setSelectedMessageId(null);
        setFullMessage(null);
      }

      showToast('Message deleted', 'info');
    } catch (err) {
      console.error('Failed to delete message:', err);
      showToast('Failed to delete message', 'error');
    }
  };

  const handleClearAllMessages = () => {
    if (!currentTab) return;
    if (window.confirm('Delete all messages in this temporary mailbox?')) {
      (currentTab.messages || []).forEach((m) => {
        axios.delete(`/api/mailbox/messages/${m.id}`, {
          headers: {
            Authorization: `Bearer ${currentTab.token}`,
            'x-provider': currentTab.provider || 'mailgw',
          },
        }).catch(() => {});
      });

      setTabs((prev) =>
        prev.map((t) => (t.id === currentTab.id ? { ...t, messages: [] } : t))
      );
      setSelectedMessageId(null);
      setFullMessage(null);
      showToast('Cleared inbox messages', 'info');
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header Navigation Bar */}
      <Header
        activeDomainsCount={domains.length}
        vaultCount={vaultItems.length}
        onOpenVault={() => setIsVaultOpen(true)}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn(!soundOn)}
        currentTheme={currentTheme}
        onChangeTheme={setCurrentTheme}
      />

      {/* 2. Active Email Bar & Actions Cluster */}
      <EmailBar
        currentMailbox={currentTab}
        isLocked={currentTab?.isLocked}
        onToggleLock={handleToggleLock}
        onOpenCustomize={() => setIsCustomizeOpen(true)}
        onGenerateRandom={() => handleCreateMailbox()}
        onOpenQR={() => setIsQROpen(true)}
        onManualRefresh={() => {
          if (currentTab) fetchMessagesForTab(currentTab, false);
          setCountdownSecs(POLL_INTERVAL_SECONDS);
        }}
        isRefreshing={isRefreshing}
        countdownSecs={countdownSecs}
        maxCountdown={POLL_INTERVAL_SECONDS}
        onShowToast={showToast}
        domainStealthInfo={domainStealthInfo}
      />

      {/* 3. Concurrent Multi-Inbox Tabs */}
      <InboxTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(tabId) => {
          setActiveTabId(tabId);
          setSelectedMessageId(null);
          const clicked = tabs.find((t) => t.id === tabId);
          if (clicked) fetchMessagesForTab(clicked, false);
        }}
        onAddTab={handleAddTab}
        onCloseTab={handleCloseTab}
      />

      {/* 4. Split View Workspace: Message List & Rich Reader */}
      <div className="inbox-grid">
        <MessageList
          messages={currentTab?.messages || []}
          selectedMessageId={selectedMessageId}
          onSelectMessage={(msgId) => setSelectedMessageId(msgId)}
          onClearAllMessages={handleClearAllMessages}
          isLoading={isRefreshing}
          currentAddress={currentTab?.address}
        />

        <MessageDetail
          message={fullMessage}
          isLoading={messageLoading}
          onDeleteMessage={handleDeleteMessage}
          onShowToast={showToast}
          authToken={currentTab?.token}
          provider={currentTab?.provider}
        />
      </div>

      {/* 5. Modals */}
      {/* Locked Vault Modal */}
      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        vaultItems={vaultItems}
        onRestoreToTab={handleRestoreFromVault}
        onRemoveFromVault={handleRemoveFromVault}
        onUpdateNote={handleUpdateNote}
        onImportVault={handleImportVault}
        onShowToast={showToast}
      />

      {/* Customize & Domain Picker Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        domains={domains}
        onCreateMailbox={handleCreateMailbox}
        isCreating={isCreatingMailbox}
      />

      {/* Mobile QR Code Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        emailAddress={currentTab?.address}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
