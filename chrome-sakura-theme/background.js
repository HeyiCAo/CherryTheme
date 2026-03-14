// Klein Blue RGB: [0, 47, 167] or hex #002FA7
// White RGB: [255, 255, 255]

const KLEIN_BLUE = [0, 47, 167];
const WHITE = [255, 255, 255];

// Day hours (6 AM to 6 PM) - fallback when system theme detection unavailable
const DAY_START = 6;
const DAY_END = 18;

function isDaytime() {
  const hour = new Date().getHours();
  return hour >= DAY_START && hour < DAY_END;
}

function getThemeColors(isDay) {
  const mainColor = isDay ? WHITE : KLEIN_BLUE;
  
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

function applyTheme(isDay) {
  const theme = getThemeColors(isDay);
  if (chrome.theme && chrome.theme.update) {
    chrome.theme.update(theme);
    console.log(`Theme applied: ${isDay ? 'Day (White)' : 'Night (Klein Blue)'}`);
  } else {
    console.warn('chrome.theme API is not available');
  }
}

// Check system color scheme by creating an offscreen document or using time-based fallback
async function getSystemTheme() {
  // Try to use chrome.system.display if available (Chrome 116+)
  if (chrome.system && chrome.system.display) {
    try {
      const displays = await chrome.system.display.getInfo();
      // Use primary display info if available
      // Note: This doesn't directly give us dark mode status, so we fall back to time
    } catch (e) {
      // Fallback to time-based
    }
  }
  // Default: use time-based detection
  return isDaytime();
}

// Initial theme application
chrome.runtime.onInstalled.addListener(async () => {
  const isDay = await getSystemTheme();
  applyTheme(isDay);
});

// Update theme when browser starts
chrome.runtime.onStartup.addListener(async () => {
  const isDay = await getSystemTheme();
  applyTheme(isDay);
});

// Check and update theme every 30 minutes to catch day/night transitions
chrome.alarms.create("themeCheck", { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "themeCheck") {
    const isDay = await getSystemTheme();
    applyTheme(isDay);
  }
});

// Manual toggle for switching between day/night modes
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get(['overrideMode'], (result) => {
    const currentOverride = result.overrideMode;
    
    // Toggle override state
    let newOverride;
    if (currentOverride === undefined) {
      // First click: override with opposite of current mode
      const currentIsDay = isDaytime();
      newOverride = currentIsDay ? 'night' : 'day';
    } else if (currentOverride === 'day') {
      newOverride = 'night';
    } else if (currentOverride === 'night') {
      newOverride = null; // Clear override, return to auto (time-based)
    } else {
      newOverride = 'day';
    }
    
    if (newOverride) {
      chrome.storage.local.set({ overrideMode: newOverride });
      applyTheme(newOverride === 'day');
      console.log(`Manual override set to: ${newOverride}`);
    } else {
      chrome.storage.local.remove('overrideMode');
      const isDay = isDaytime();
      applyTheme(isDay);
      console.log('Override cleared, returned to auto mode');
    }
  });
});
