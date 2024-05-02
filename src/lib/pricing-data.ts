export type PlanTier = {
  name: string;
  pricePerSeat: number; // monthly USD
  minSeats?: number;
  maxSeats?: number;
  features: string[];
  bestFor: string;
};

export type Tool = {
  id: string;
  name: string;
  category: 'coding' | 'writing' | 'general' | 'api';
  plans: Record<string, PlanTier>;
  officialPricingUrl: string;
};

export const PRICING_DATA: Record<string, Tool> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    officialPricingUrl: 'https://cursor.com/pricing',
    plans: {
      hobby: { name: 'Hobby', pricePerSeat: 0, features: [], bestFor: 'Individuals trying out the IDE' },
      pro: { name: 'Pro', pricePerSeat: 20, features: [], bestFor: 'Professional developers' },
      business: { name: 'Business', pricePerSeat: 40, features: [], bestFor: 'Teams needing centralized billing and privacy' }
    }
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    officialPricingUrl: 'https://github.com/features/copilot',
    plans: {
      individual: { name: 'Individual', pricePerSeat: 10, features: [], bestFor: 'Solo developers' },
      business: { name: 'Business', pricePerSeat: 19, features: [], bestFor: 'Standard engineering teams' },
      enterprise: { name: 'Enterprise', pricePerSeat: 39, features: [], bestFor: 'Large organizations needing fine-tuned models' }
    }
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    category: 'writing',
    officialPricingUrl: 'https://claude.ai/pricing',
    plans: {
      free: { name: 'Free', pricePerSeat: 0, features: [], bestFor: 'Casual use' },
      pro: { name: 'Pro', pricePerSeat: 20, features: [], bestFor: 'Heavy individual use' },
      team: { name: 'Team', pricePerSeat: 30, minSeats: 5, features: [], bestFor: 'Teams needing collaborative chat' },
      max: { name: 'Max', pricePerSeat: 100, features: [], bestFor: 'Power users needing extreme context limits' }
    }
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'writing',
    officialPricingUrl: 'https://openai.com/chatgpt/pricing',
    plans: {
      free: { name: 'Free', pricePerSeat: 0, features: [], bestFor: 'Casual use' },
      plus: { name: 'Plus', pricePerSeat: 20, features: [], bestFor: 'Individuals needing advanced models' },
      team: { name: 'Team', pricePerSeat: 30, minSeats: 2, features: [], bestFor: 'Small teams' },
      enterprise: { name: 'Enterprise', pricePerSeat: 60, features: [], bestFor: 'Large enterprises' }
    }
  },
  'anthropic-api': {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'api',
    officialPricingUrl: 'https://www.anthropic.com/pricing',
    plans: {
      api: { name: 'API Direct', pricePerSeat: 0, features: [], bestFor: 'Developers building AI features or internal tools' }
    }
  },
  'openai-api': {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'api',
    officialPricingUrl: 'https://openai.com/pricing',
    plans: {
      api: { name: 'API Direct', pricePerSeat: 0, features: [], bestFor: 'Developers building AI features or internal tools' }
    }
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    category: 'general',
    officialPricingUrl: 'https://gemini.google.com/advanced',
    plans: {
      free: { name: 'Free', pricePerSeat: 0, features: [], bestFor: 'Basic usage' },
      pro: { name: 'Pro', pricePerSeat: 19.99, features: [], bestFor: 'Individuals within Google ecosystem' },
      ultra: { name: 'Ultra/Advanced', pricePerSeat: 29.99, features: [], bestFor: 'Power users within Google ecosystem' },
      api: { name: 'API', pricePerSeat: 0, features: [], bestFor: 'Developers' }
    }
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'coding',
    officialPricingUrl: 'https://codeium.com/windsurf',
    plans: {
      free: { name: 'Free', pricePerSeat: 0, features: [], bestFor: 'Basic IDE needs' },
      pro: { name: 'Pro', pricePerSeat: 15, features: [], bestFor: 'Individuals' },
      team: { name: 'Team', pricePerSeat: 35, features: [], bestFor: 'Teams' }
    }
  }
};
