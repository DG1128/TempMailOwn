import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Mail, RefreshCw, Copy, Trash2, Send, Plus, X, Loader2 } from 'lucide-react';
import { getDomains, createAccount, getToken, getMessages, getMessage, sendMessage, deleteMessage } from './api';

function App() {
  const [domains, setDomains] = useState([]);
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem('temp_mail_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDomain, setSelectedDomain] = useState('');
  const [username, setUsername] = useState('');
  const [viewingMessage, setViewingMessage] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [filter, setFilter] = useState('');

  // Fetch domains on mount
  useEffect(() => {
    getDomains().then(data => {
      setDomains(data);
      if (data.length > 0) setSelectedDomain(data[0].domain);
    }).catch(console.error);
  }, []);

  // Poll messages every 2 seconds if logged in
  const { data: messages, mutate, error: msgError, isLoading: msgLoading } = useSWR(
    account ? ['/messages', account.token] : null,
    ([url, token]) => getMessages(token),
    { refreshInterval: 2000, revalidateOnFocus: false }
  );

  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    if (messages || msgError) {
      setLastChecked(new Date());
    }
  }, [messages, msgError]);


  const handleCreateAccount = async () => {
    if (!username || !selectedDomain) return;
    setLoadingAccount(true);
    // ... (existing logic) ...

    try {
      const address = `${username}@${selectedDomain}`;
      const password = 'TempPassword123!';
      let created = false;

      try {
        await createAccount(address, password);
        created = true;
      } catch (e) {
        // If error is not 422 (Unprocessable Entity - likely exists), rethrow
        if (e.response && e.response.status !== 422) {
          throw e;
        }
      }

      try {
        const token = await getToken(address, password);
        const newAccount = { address, password, token };
        setAccount(newAccount);
        localStorage.setItem('temp_mail_account', JSON.stringify(newAccount));
        setUsername('');
      } catch (e) {
        if (!created) {
          // We didn't create it, and we can't login -> Username taken by someone else
          throw new Error("Username is already taken. Please try another.");
        }
        throw e;
      }
    } catch (error) {
      alert(error.message || 'Error creating account');
    } finally {
      setLoadingAccount(false);
    }
  };

  const generateRandomParams = () => {
    setUsername(Math.random().toString(36).substring(7));
  };

  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('temp_mail_account');
    setViewingMessage(null);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await sendMessage(account.token, account.address, composeData.to, composeData.subject, composeData.body);
      alert('Email sent successfully!');
      setIsComposeOpen(false);
      setComposeData({ to: '', subject: '', body: '' });
    } catch (error) {
      alert('Failed to send: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(account.token, id);
      mutate(); // Refresh list
      if (viewingMessage?.id === id) setViewingMessage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account.address);
    alert("Copied!");
  };

  const filteredMessages = messages?.filter(msg =>
    msg.subject?.toLowerCase().includes(filter.toLowerCase()) ||
    msg.from?.address?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar / Setup */}
      <div className="w-full md:w-80 bg-slate-800 p-6 flex flex-col gap-6 border-r border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
          <Mail className="w-6 h-6" /> TempMail
        </h1>

        {!account ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Create Inbox</h2>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Username</label>
              <div className="flex gap-2">
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: mytmp"
                />
                <button onClick={generateRandomParams} className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded px-3 text-slate-300" title="Random Username">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Domain</label>
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {domains.slice(0, 5).map(d => ( // Limit to 5 custom domains as requested
                  <option key={d.id} value={d.domain}>@{d.domain}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateAccount}
              disabled={loadingAccount || !username}
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              {loadingAccount ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Inbox
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Current Address</span>
              <div className="mt-1 font-mono text-sm break-all text-blue-300">
                {account.address}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={copyToClipboard} className="flex-1 bg-slate-600 hover:bg-slate-500 py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors">
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button onClick={handleLogout} className="px-3 bg-red-900/50 hover:bg-red-900/70 text-red-200 rounded text-xs transition-colors">
                  Logout
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsComposeOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium shadow-lg transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" /> Compose Email
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">Inbox</h2>
            {account && (
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full animate-pulse">
                  <RefreshCw className="w-3 h-3" /> Live (2s)
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  Last check: {lastChecked.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          {account && (
            <div className="flex gap-2">
              <button onClick={() => mutate()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" title="Force Refresh">
                <RefreshCw className={`w-4 h-4 ${msgLoading ? 'animate-spin' : ''}`} />
              </button>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter emails..."
                className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Message List */}
          <div className={`${viewingMessage ? 'hidden md:block w-full md:w-1/3 border-r border-slate-700' : 'w-full'} overflow-y-auto bg-slate-900`}>
            {msgError && (
              <div className="p-4 bg-red-900/50 text-red-200 text-xs border-b border-red-900">
                Error fetching messages: {msgError.message}. Make sure you are online.
              </div>
            )}
            {!account ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic">
                Create an inbox to start
              </div>
            ) : messages?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                <Mail className="w-8 h-8 opacity-20" />
                No messages yet
                <button onClick={() => mutate()} className="text-blue-400 text-xs hover:underline">Check Again</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      // Fetch full content
                      getMessage(account.token, msg.id).then(setViewingMessage);
                    }}
                    className={`p-4 cursor-pointer hover:bg-slate-800 transition-colors ${viewingMessage?.id === msg.id ? 'bg-slate-800 border-l-2 border-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm text-slate-200 truncate pr-2">{msg.from.name || msg.from.address}</div>
                      <button onClick={(e) => handleDeleteMessage(e, msg.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <div className="text-sm font-medium text-blue-300 truncate mb-1">{msg.subject || '(No Subject)'}</div>
                    <div className="text-xs text-slate-400 truncate">{msg.intro}</div>
                    <div className="text-[10px] text-slate-500 mt-2 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Viewer */}
          {viewingMessage && (
            <div className={`${viewingMessage ? 'w-full md:flex-1' : 'hidden'} flex flex-col bg-slate-800 overflow-hidden absolute md:relative inset-0 z-10`}>
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                <button onClick={() => setViewingMessage(null)} className="md:hidden text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                <div className="flex-1 ml-4 md:ml-0">
                  <h3 className="font-bold text-lg">{viewingMessage.subject}</h3>
                  <div className="text-sm text-slate-400 mt-1">
                    From: <span className="text-slate-200">{viewingMessage.from.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-900">
                {/* Safe HTML rendering */}
                {viewingMessage.html ? (
                  <div dangerouslySetInnerHTML={{ __html: viewingMessage.html }} className="prose max-w-none" />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{viewingMessage.text}</pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 w-full max-w-lg rounded-lg shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Send className="w-4 h-4 text-emerald-400" /> New Message</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">To</label>
                <input
                  value={composeData.to}
                  onChange={e => setComposeData({ ...composeData, to: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                <input
                  value={composeData.subject}
                  onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Subject"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  value={composeData.body}
                  onChange={e => setComposeData({ ...composeData, body: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none h-40 resize-none"
                  placeholder="Write your message..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={handleSend}
                disabled={sending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
