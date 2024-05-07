'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

export function ShareButton({ shareId }: { shareId: string }) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  
  // Get URL on mount to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBaseUrl(window.location.origin);
  }, []);

  const url = `${baseUrl}/audit/${shareId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const tweetText = encodeURIComponent(`Just audited our AI tool spend. Found savings with SpendLens by @credex — try it free: ${url}`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-[#202028] hover:bg-[#2A2A35] rounded-md text-sm font-medium transition-colors border border-[#303038]"
      >
        {copied ? <Check className="w-4 h-4 text-[#00E5A0]" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      
      <a 
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-md text-sm font-medium transition-colors border border-[#1DA1F2]/20"
      >
        <Share2 className="w-4 h-4" />
        Share
      </a>
    </div>
  );
}
