// Klein Blue RGB: [0, 47, 167] or hex #002FA7
// Sky Blue RGB: [135, 206, 235]

const KLEIN_BLUE = [0, 47, 167];
const SKY_BLUE = [135, 206, 235];

// Day hours (6 AM to 6 PM)
const DAY_START = 6;
const DAY_END = 18;

function isDaytime() {
  const hour = new Date().getHours();
  return hour >= DAY_START && hour < DAY_END;
}

function getThemeColors(isDay) {
  const mainColor = isDay ? SKY_BLUE : KLEIN_BLUE;
  
  return {
    colors: {
      frame: mainColor,
      toolbar: mainColor,
      tab_text: isDay ? [0, 0, 0] : [255, 255, 255],
      bookmark_text: isDay ? [0, 0, 0] : [255, 255, 255],
      ntp_link: isDay ? [0, 0, 0] : [255, 255, 255],
      ntp_section: isDay ? [240, 240, 240] : [10, 30, 120],
      ntp_text: isDay ? [0, 0, 0] : [255, 255, 255],
      ntp_header: mainColor,
      button_background: mainColor
    },
    tints: {
      buttons: isDay ? [0.5, 0.0, 0.5] : [0.5, 0.2, 0.8]
    },
    properties: {
      ntp_background_alignment: "bottom"
    },
    images: {
      theme_frame: "sakura_pixel.png",
      ntp_background: "sakura_pixel.png"
    }
  };
}

function getThemeApi() {
  if (typeof browser !== 'undefined' && browser.theme) return browser.theme;
  if (typeof chrome !== 'undefined' && chrome.theme) return chrome.theme;
  return null;
}

function applyTheme(isDay, reason) {
  const theme = getThemeColors(isDay);
  const themeApi = getThemeApi();
  if (!themeApi || typeof themeApi.update !== 'function') {
    console.warn('Theme API not available in this browser.');
    return;
  }
  themeApi.update(theme);
  console.log(
    `Theme applied: ${isDay ? 'Day (Sky Blue)' : 'Night (Klein Blue)'}${reason ? ` (${reason})` : ''}`
  );
}

function applyThemeFromMode(reason) {
  chrome.storage.local.get(['forceMode'], (result) => {
    const currentForceMode = result.forceMode || null;
    if (currentForceMode === 'day') {
      applyTheme(true, reason || 'forced day');
      return;
    }
    if (currentForceMode === 'night') {
      applyTheme(false, reason || 'forced night');
      return;
    }
    applyTheme(isDaytime(), reason || 'auto');
  });
}

// Initial theme application
chrome.runtime.onInstalled.addListener(() => {
  applyThemeFromMode('install');
});

// Update theme when browser starts
chrome.runtime.onStartup.addListener(() => {
  applyThemeFromMode('startup');
});

// Check and update theme every hour
chrome.alarms.create("themeCheck", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "themeCheck") {
    applyThemeFromMode('alarm');
  }
});

// Allow manual toggle via action button
chrome.action.onClicked.addListener(() => {
  // Toggle between day and night theme manually
  chrome.storage.local.get(['forceMode'], (result) => {
    const currentForceMode = result.forceMode || null;
    const newForceMode = currentForceMode === 'day' ? 'night' :
                         currentForceMode === 'night' ? null : 'day';

    if (newForceMode === null) {
      // Auto mode - based on time
      chrome.storage.local.remove(['forceMode']);
      applyThemeFromMode('toggle auto');
      return;
    }

    chrome.storage.local.set({ forceMode: newForceMode });
    applyTheme(newForceMode === 'day', 'toggle forced');
  });
});
