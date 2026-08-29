import { Session } from 'electron';

// EasyList ad blocking filter rules (comprehensive core rules)
const AD_BLOCK_DOMAINS = [
  'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
  'adnxs.com', 'ads.twitter.com', 'facebook.com/tr', 'amazon-adsystem.com',
  'moatads.com', 'scorecardresearch.com', 'quantserve.com', 'outbrain.com',
  'taboola.com', 'zedo.com', 'adbrite.com', 'advertising.com',
  'adsafeprotected.com', 'adsrvr.org', 'adtechus.com', 'yieldmanager.com',
  'ads.yahoo.com', 'bing.com/ads', 'openx.net', 'pubmatic.com',
  'rubiconproject.com', 'spotxchange.com', 'serving-sys.com', 'media.net',
  'criteo.com', 'criteo.net', 'tradedesk.net', 'liverail.com',
  'turn.com', 'casalemedia.com', 'appnexus.com', '33across.com',
  'smartadserver.com', 'yieldlab.net', 'sharethrough.com', 'gemius.pl',
  'intergi.com', 'gravity.com', 'tribal-fusion.com', 'trafficworks.biz',
  'adcolony.com', 'applovin.com', 'chartboost.com', 'vungle.com', 'unityads.unity3d.com',
];

const TRACKER_DOMAINS = [
  'google-analytics.com', 'googletagmanager.com', 'hotjar.com',
  'mixpanel.com', 'segment.io', 'segment.com', 'amplitude.com',
  'optimizely.com', 'fullstory.com', 'loggly.com', 'chartbeat.com',
  'parsely.com', 'nielsen.com', 'comscore.com', 'newrelic.com',
  'statcounter.com', 'yandex.ru/metrika', 'mouseflow.com', 'clarity.ms',
];

const AD_BLOCK_URL_PATTERNS = [
  '/ads/', '/ad/', '/banner/', '/popup/', '/tracking/', '/tracker/',
  'advert', '/analytics/', '&utm_', '?utm_', 'clicktrack', 'pagead',
  '/pixel.', '/beacon.', '/track.', 'telemetry', '/ad-delivery/',
];

let blockedCount = 0;
let isShieldEnabled = true;
let isTrackerBlockingEnabled = true;
let isHttpsUpgradeEnabled = true;

export async function setupAdBlocker(sess: Session): Promise<void> {
  sess.webRequest.onBeforeRequest(
    { urls: ['<all_urls>'] },
    (details, callback) => {
      if (!isShieldEnabled) {
        callback({});
        return;
      }

      const url = details.url.toLowerCase();

      // Check ad blocker domains
      const isBlockedDomain = AD_BLOCK_DOMAINS.some((domain) =>
        url.includes(domain)
      );

      // Check tracker domains
      const isTracker = isTrackerBlockingEnabled && TRACKER_DOMAINS.some((domain) =>
        url.includes(domain)
      );

      // Check URL patterns
      const isBlockedPattern = AD_BLOCK_URL_PATTERNS.some((pattern) =>
        url.includes(pattern)
      );

      if (isBlockedDomain || isTracker || isBlockedPattern) {
        blockedCount++;
        callback({ cancel: true });
        return;
      }

      // Check HTTPS Upgrade
      if (isHttpsUpgradeEnabled && url.startsWith('http://')) {
        if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
          const httpsUrl = details.url.replace(/^http:\/\//i, 'https://');
          callback({ redirectURL: httpsUrl });
          return;
        }
      }

      callback({});
    }
  );

  // Security headers
  sess.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['SAMEORIGIN'],
        'Referrer-Policy': ['strict-origin-when-cross-origin'],
      },
    });
  });

  console.log('[Aasth] Ad blocker initialized');
}

export function getBlockedCount(): number {
  return blockedCount;
}

export function setShieldEnabled(enabled: boolean): void {
  isShieldEnabled = enabled;
}

export function getShieldEnabled(): boolean {
  return isShieldEnabled;
}

export function setTrackerBlockingEnabled(enabled: boolean): void {
  isTrackerBlockingEnabled = enabled;
}

export function setHttpsUpgradeEnabled(enabled: boolean): void {
  isHttpsUpgradeEnabled = enabled;
}
