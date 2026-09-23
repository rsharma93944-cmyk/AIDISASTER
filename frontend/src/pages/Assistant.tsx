import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import {
  Send, Trash2, MapPin, AlertTriangle, BarChart3,
  Mountain, Shield, Image as ImageIcon,
  MessageCircle, Clock, Bot, ChevronRight, Info, Phone, PhoneCall
} from 'lucide-react';
import {
  ChatMessage,
  sendMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '../services/assistantService';
import { SUGGESTED_QUESTIONS } from '../data/assistantKnowledge';
import EmergencyContactsModal from '../components/EmergencyContactsModal';

/* ─── simple markdown-ish renderer ─── */
function renderMarkdown(text: string) {
  // Split by double-newline to make paragraphs
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => {
    // numbered list
    if (/^\d+\.\s/.test(block.trim())) {
      const items = block.split(/\n/).filter(Boolean);
      return (
        <ol key={bi} className="list-decimal list-inside space-y-1 my-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="text-[13px] leading-relaxed">
              {renderInline(item.replace(/^\d+\.\s*/, ''))}
            </li>
          ))}
        </ol>
      );
    }
    // bullet list
    if (/^[-•]\s/.test(block.trim())) {
      const items = block.split(/\n/).filter(Boolean);
      return (
        <ul key={bi} className="list-disc list-inside space-y-1 my-1.5">
          {items.map((item, ii) => (
            <li key={ii} className="text-[13px] leading-relaxed">
              {renderInline(item.replace(/^[-•]\s*/, ''))}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="text-[13px] leading-relaxed my-1">
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string) {
  // bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#1C2826]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-[#5E7E67]">
          {part.slice(1, -1)}
        </em>
      );
    }
    // inline code `text`
    const codeParts = part.split(/(`[^`]+`)/g);
    if (codeParts.length > 1) {
      return codeParts.map((cp, ci) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return (
            <code key={ci} className="px-1 py-0.5 bg-[#244A36]/8 rounded text-[12px] font-mono text-[#244A36]">
              {cp.slice(1, -1)}
            </code>
          );
        }
        return cp;
      });
    }
    return part;
  });
}

/* ─── Quick-action icon map ─── */
function getQuickActionIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('helpline') || l.includes('emergency') || l.includes('call') || l.includes('contact')) return <Phone className="w-3 h-3 text-[#7A2E2E]" />;
  if (l.includes('risk')) return <BarChart3 className="w-3 h-3" />;
  if (l.includes('map')) return <MapPin className="w-3 h-3" />;
  if (l.includes('alert')) return <AlertTriangle className="w-3 h-3" />;
  if (l.includes('image') || l.includes('analysis')) return <ImageIcon className="w-3 h-3" />;
  if (l.includes('safety')) return <Shield className="w-3 h-3" />;
  return <ChevronRight className="w-3 h-3" />;
}

/* ─── Navigates using browser history (consistent with App.tsx) ─── */
function appNavigate(path: string) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Persist to localStorage on message change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const prompt = (text || inputText).trim();
    if (!prompt || isTyping) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const reply = await sendMessage(prompt);
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: 'An error occurred while processing your request. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    const fresh = clearChatHistory();
    setMessages(fresh);
  };

  const handleQuickAction = (action: string, path?: string) => {
    if (action === 'emergency_modal' || action === 'emergency') {
      setEmergencyModalOpen(true);
    } else if (action === 'navigate' && path) {
      appNavigate(path);
    } else if (action === 'suggest' && path) {
      handleSend(path);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col font-sans selection:bg-[#244A36]/20">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Sidebar Context & Quick Actions (desktop) ── */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-4 order-2 lg:order-1">

          {/* Monitoring Context Card */}
          <div className="liquid-glass rounded-2xl border border-white/60 p-4 shadow-lg shadow-[#244A36]/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/80 border border-white/80 flex items-center justify-center shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#244A36]" />
              </div>
              <span className="text-xs font-bold text-[#1C2826] uppercase tracking-wider">Monitoring Context</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#5E7E67] font-medium">Region</span>
                <span className="text-[11px] font-bold text-[#244A36]">Northeast India</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#5E7E67] font-medium">Priority Zone</span>
                <span className="text-[11px] font-bold text-[#1C2826]">Melli–Jorethang</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#5E7E67] font-medium">Risk Level</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C87941]/15 text-[#C87941] border border-[#C87941]/25">HIGH · 78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#5E7E67] font-medium">Rainfall (24h)</span>
                <span className="text-[11px] font-bold text-[#1C2826]">142 mm</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#244A36]/8">
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-[#C87941] flex-shrink-0 mt-0.5" />
                <span className="text-[10px] text-[#5E7E67] leading-tight font-medium">
                  Prototype monitoring data. Not connected to a live backend.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="liquid-glass rounded-2xl border border-white/60 p-4 shadow-lg shadow-[#244A36]/5">
            <span className="text-xs font-bold text-[#1C2826] uppercase tracking-wider block mb-3">Quick Actions</span>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                { label: 'Emergency Helplines (112)', action: 'modal', icon: <PhoneCall className="w-3.5 h-3.5 text-[#7A2E2E]" />, isEmergency: true },
                { label: 'Check Risk', path: '/risk-monitoring', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                { label: 'View Live Map', path: '/live-map', icon: <MapPin className="w-3.5 h-3.5" /> },
                { label: 'View Alerts', path: '/alerts', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                { label: 'Analyze Image', path: '/analysis', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                { label: 'Safety Guide', path: '', icon: <Shield className="w-3.5 h-3.5" /> },
              ].map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => {
                    if (qa.action === 'modal') {
                      setEmergencyModalOpen(true);
                    } else if (qa.path) {
                      appNavigate(qa.path);
                    } else {
                      handleSend('What should I do during a landslide warning?');
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-[1.02] shadow-sm ${
                    qa.isEmergency 
                      ? 'text-[#7A2E2E] bg-[#7A2E2E]/10 hover:bg-[#7A2E2E]/15 border border-[#7A2E2E]/25' 
                      : 'text-[#244A36] bg-white/70 hover:bg-white border border-white/70'
                  }`}
                >
                  {qa.icon}
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Disclosure */}
          <div className="glass-card rounded-2xl p-3.5 border border-white/60">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-[#244A36]" />
              <span className="text-[11px] font-bold text-[#244A36]">About This Assistant</span>
            </div>
            <p className="text-[10.5px] text-[#2B3A33] leading-relaxed font-medium">
              This is a <strong>prototype knowledge-based assistant</strong>. Responses are drawn from a predefined
              disaster-management knowledge base and are not generated by a live AI model. A backend API can be
              connected in future iterations.
            </p>
          </div>
        </aside>

        {/* ── RIGHT: Chat Panel ── */}
        <div className="flex-1 flex flex-col order-1 lg:order-2 min-h-[70vh] lg:min-h-0">
          {/* Chat Header */}
          <div className="liquid-glass rounded-t-3xl border border-b-0 border-white/60 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#244A36] flex items-center justify-center shadow-md shadow-[#244A36]/20">
                  <Mountain className="w-5 h-5 text-[#A3C7AD]" />
                </div>
                <div>
                  <h1 className="text-[15px] font-bold text-[#1C2826] leading-tight">
                    ResQAI Disaster Assistant
                  </h1>
                  <p className="text-[11px] text-[#5E7E67] mt-0.5 font-medium">
                    Your project-focused assistant for landslide risk, warnings and preparedness.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-[#244A36] bg-white/70 border border-white/80 px-2.5 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#526E48] animate-pulse" />
                  Prototype
                </span>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5E7E67] hover:bg-white/80 hover:text-[#7A2E2E] border border-white/60 transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 bg-[#FAF7F2]/40 backdrop-blur-lg border-x border-white/60 overflow-y-auto px-4 md:px-5 py-4 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#244A36] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
                    <Mountain className="w-3.5 h-3.5 text-[#A3C7AD]" />
                  </div>
                )}
                <div className={`max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? '' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-[#244A36] text-[#FAF7F2] rounded-br-md shadow-md shadow-[#244A36]/15'
                        : 'glass-card border border-white/70 text-[#1C2826] rounded-bl-md shadow-md shadow-[#244A36]/5'
                    }`}
                  >
                    {msg.title && msg.sender === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#244A36]/8">
                        <MessageCircle className="w-3 h-3 text-[#244A36]" />
                        <span className="text-[11px] font-bold text-[#244A36] uppercase tracking-wider">{msg.title}</span>
                      </div>
                    )}
                    <div className={msg.sender === 'user' ? 'text-[13px] leading-relaxed font-medium' : ''}>
                      {msg.sender === 'assistant' ? renderMarkdown(msg.text) : msg.text}
                    </div>

                    {/* Prototype notice on first message */}
                    {msg.isPrototypeNotice && (
                      <div className="mt-3 pt-2 border-t border-[#244A36]/8 flex items-start gap-1.5">
                        <Info className="w-3 h-3 text-[#C87941] flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-[#5E7E67] font-medium">
                          Responses use a predefined knowledge base. Not connected to a live AI model.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick actions from response */}
                  {msg.quickActions && msg.quickActions.length > 0 && msg.sender === 'assistant' && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickActions.map((qa, qi) => (
                        <button
                          key={qi}
                          type="button"
                          onClick={() => handleQuickAction(qa.action, qa.path)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold text-[#244A36] bg-white/80 hover:bg-white border border-white/70 shadow-sm transition-all hover:scale-[1.02]"
                        >
                          {getQuickActionIcon(qa.label)}
                          <span>{qa.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-ups */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && msg.sender === 'assistant' && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedFollowUps.map((sq, si) => (
                        <button
                          key={si}
                          type="button"
                          onClick={() => handleSend(sq)}
                          className="px-2.5 py-1 rounded-lg text-[10.5px] font-medium text-[#5E7E67] bg-white/70 border border-white/70 hover:bg-white hover:text-[#244A36] shadow-sm transition-all hover:scale-[1.02]"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`mt-1 flex items-center gap-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    <Clock className="w-2.5 h-2.5 text-[#5E7E67]/60" />
                    <span className="text-[9.5px] text-[#5E7E67]/60 font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#244A36] flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
                  <Mountain className="w-3.5 h-3.5 text-[#A3C7AD]" />
                </div>
                <div className="glass-card border border-white/70 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244A36]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244A36]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#244A36]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] text-[#5E7E67] ml-1 font-medium">Searching knowledge base…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions — shown when few messages */}
          {messages.length <= 2 && (
            <div className="bg-white/60 backdrop-blur-md border-x border-white/60 px-4 md:px-5 py-3">
              <span className="text-[10px] font-bold text-[#5E7E67] uppercase tracking-wider block mb-2">Suggested Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium text-[#244A36] bg-white/80 hover:bg-white border border-white/70 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="liquid-glass rounded-b-3xl border border-t-0 border-white/60 px-4 md:px-5 py-3 shadow-lg shadow-[#244A36]/5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about landslide risk, safety actions, or ResQAI features…"
                rows={1}
                className="flex-1 resize-none bg-white/80 backdrop-blur-md border border-white/70 rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2826] placeholder:text-[#5E7E67]/60 focus:outline-none focus:ring-2 focus:ring-[#244A36]/20 focus:border-[#244A36]/30 transition-all shadow-inner"
                style={{ maxHeight: '120px' }}
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-[#244A36] text-[#FAF7F2] flex items-center justify-center hover:bg-[#1B3828] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#244A36]/20 flex-shrink-0 hover:scale-[1.03]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between font-medium">
              <span className="text-[9.5px] text-[#5E7E67]/70">
                Press Enter to send · Shift+Enter for new line
              </span>
              <span className="text-[9.5px] text-[#5E7E67]/70">
                Predefined knowledge · Not live AI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Helplines Modal */}
      <EmergencyContactsModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
