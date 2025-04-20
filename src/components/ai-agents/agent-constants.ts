
export const voiceStyles = [
  { value: "Friendly", label: "Friendly" },
  { value: "Professional", label: "Professional" },
  { value: "Confident", label: "Confident" },
  { value: "Calm", label: "Calm" },
];

export const businessTypes = [
  { value: "Real Estate", label: "Real Estate" },
  { value: "Debt Collection", label: "Debt Collection" },
  { value: "Loan", label: "Loan" },
  { value: "B2B", label: "B2B" },
  { value: "Custom", label: "Custom" },
];

// Preset greeting scripts by style and business type
export const greetingScriptPresets: Record<string, Record<string, string>> = {
  Friendly: {
    "Real Estate": "Hi there, I'm your friendly assistant here to help you with all your real estate needs! How can I help you today?",
    "Debt Collection": "Hello! I’m reaching out in a friendly way regarding your outstanding balance. How can I support you?",
    "Loan": "Hey! I hope you’re having a great day. I’m your assistant to guide you through your loan process.",
    "B2B": "Hi! I’m here to assist with your business needs. Let me know how I can help.",
    "Custom": "Hello! I’m here to help as your AI agent.",
  },
  Professional: {
    "Real Estate": "Good day, this is your professional real estate agent. How may I assist you?",
    "Debt Collection": "Greetings. I am reaching out concerning your account balance. How may I help resolve this matter?",
    "Loan": "Hello. I am an AI agent assisting you with your loan application. Please let me know how I can help.",
    "B2B": "Hello. This is your AI business assistant. What can I do for you today?",
    "Custom": "Hello. I am your professional AI agent.",
  },
  Confident: {
    "Real Estate": "Hello, I’m your confident AI assistant, ready to help you navigate real estate opportunities.",
    "Debt Collection": "This is your agent following up confidently on your account. Let’s find a solution that works.",
    "Loan": "I’m here to guide you through your loan with confidence and precision.",
    "B2B": "As your AI agent, I am ready to handle your business requests efficiently.",
    "Custom": "I am your AI agent, here to assist you with confidence.",
  },
  Calm: {
    "Real Estate": "Hello, I’m your calm and steady real estate assistant. How can I support you today?",
    "Debt Collection": "Hi, I’m reaching out calmly regarding your balance. Let’s resolve this together.",
    "Loan": "Hello, I’m your AI assistant here to help you with your loan in a calm manner.",
    "B2B": "Hi there. I’m your calm business support agent. How can I help?",
    "Custom": "Hi, I’m your AI agent here to help you calmly.",
  },
};
