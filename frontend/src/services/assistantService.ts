import { ASSISTANT_KNOWLEDGE_BASE, OUT_OF_SCOPE_FALLBACK, KnowledgeItem } from '../data/assistantKnowledge';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string; path?: string }[];
  suggestedFollowUps?: string[];
  title?: string;
  isPrototypeNotice?: boolean;
}

export interface AssistantContext {
  locationName?: string;
  state?: string;
  riskLevel?: string;
  rainfall?: string;
}

const STORAGE_KEY = 'resqai_assistant_chat_history';

/**
 * Returns formatted local time string e.g. "8:45 PM"
 */
function getFormattedTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Initial greeting message from ResQAI Disaster Assistant
 */
export function getInitialGreeting(): ChatMessage {
  return {
    id: 'msg-initial-greeting',
    sender: 'assistant',
    text: `Hello! I am the **ResQAI Disaster Assistant**.

I am your project-focused assistant for landslide risk monitoring, early warning indicators, and disaster preparedness across **Northeast India**.

How can I help you today? You can choose from the suggested questions below or ask about any geotechnical factor, risk level, or safety precaution.`,
    timestamp: getFormattedTime(),
    quickActions: [
      { label: 'Check Risk Factors', action: 'navigate', path: '/risk-monitoring' },
      { label: 'View Live Map', action: 'navigate', path: '/live-map' },
      { label: 'View Alerts', action: 'navigate', path: '/alerts' },
      { label: 'Analyze Image', action: 'navigate', path: '/analysis' }
    ],
    suggestedFollowUps: [
      'Why is this location at risk?',
      'What should I do during a landslide warning?',
      'How does rainfall affect landslide risk?',
      'What is YOLO11 used for in ResQAI?'
    ],
    isPrototypeNotice: true
  };
}

/**
 * Loads stored chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load chat history from localStorage', e);
  }
  return [getInitialGreeting()];
}

/**
 * Saves chat history to localStorage
 */
export function saveChatHistory(history: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save chat history to localStorage', e);
  }
}

/**
 * Clears chat history from localStorage and resets to initial greeting
 */
export function clearChatHistory(): ChatMessage[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear chat history', e);
  }
  const initial = [getInitialGreeting()];
  saveChatHistory(initial);
  return initial;
}

/**
 * Finds the most relevant knowledge item based on keyword matching
 */
function findBestMatch(userPrompt: string): KnowledgeItem | null {
  const normalized = userPrompt.toLowerCase().trim();
  
  let bestItem: KnowledgeItem | null = null;
  let maxScore = 0;

  for (const item of ASSISTANT_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        // Longer keyword matches give higher precision
        score += keyword.length > 4 ? 3 : 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestItem = item;
    }
  }

  // Minimum match threshold
  return maxScore >= 2 ? bestItem : null;
}

/**
 * Modular function to send a message to the Assistant.
 * Structured so it can be swapped with `POST /assistant` when an AI backend is available.
 */
export async function sendMessage(
  userPrompt: string,
  _context?: AssistantContext
): Promise<ChatMessage> {
  // Simulate minimal asynchronous network latency (300ms) for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 300));

  const matched = findBestMatch(userPrompt);

  if (matched) {
    return {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      sender: 'assistant',
      title: matched.title,
      text: matched.response,
      timestamp: getFormattedTime(),
      quickActions: matched.quickActions,
      suggestedFollowUps: matched.suggestedFollowUps,
      isPrototypeNotice: false
    };
  }

  // Fallback response for out-of-scope inquiries
  return {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    sender: 'assistant',
    text: OUT_OF_SCOPE_FALLBACK,
    timestamp: getFormattedTime(),
    quickActions: [
      { label: 'Check Risk Factors', action: 'navigate', path: '/risk-monitoring' },
      { label: 'View Live Map', action: 'navigate', path: '/live-map' },
      { label: 'Safety Guidelines', action: 'suggest', path: 'What should I do during a landslide warning?' }
    ],
    suggestedFollowUps: [
      'What factors increase landslide risk?',
      'Why is this location at risk?',
      'What does High Risk mean?'
    ],
    isPrototypeNotice: false
  };
}
