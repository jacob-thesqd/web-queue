'use client';

import { useState, useEffect } from 'react';
import { apiCache } from '@/lib/api-cache';
import { globalConfig } from '@/config/globalConfig';

export default function ApiCacheDebug() {
  const [stats, setStats] = useState(apiCache.getStats());
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development and if debug caching is enabled
  const shouldShow = process.env.NODE_ENV === 'development' && 
                     globalConfig.airtable.debugCaching && 
                     globalConfig.airtable.enableGlobalApiCache;

  useEffect(() => {
    if (!shouldShow) return;

    const interval = setInterval(() => {
      setStats(apiCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono hover:bg-blue-700 transition-colors"
        title="API Cache Debug Info"
      >
        🗄️ Cache: {stats.cacheSize}
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-black/90 text-green-400 p-3 rounded-lg text-xs font-mono min-w-64">
          <div className="font-bold mb-2">🗄️ API Cache Stats</div>
          <div>Cache entries: {stats.cacheSize}</div>
          <div>Ongoing requests: {stats.ongoingRequests}</div>
          <div>Cache duration: {(stats.config.cacheDuration / 1000 / 60).toFixed(1)}min</div>
          <div className="mt-2 pt-2 border-t border-green-400/30">
            <button
              onClick={() => {
                apiCache.clear();
                setStats(apiCache.getStats());
              }}
              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 