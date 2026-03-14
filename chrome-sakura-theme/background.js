// Klein Blue RGB: [0, 47, 167] or hex #002FA7
// White RGB: [255, 255, 255]

const KLEIN_BLUE = [0, 47, 167];
const WHITE = [255, 255, 255];

// Day hours (6 AM to 6 PM)
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

// Initial theme application
chrome.runtime.onInstalled.addListener(() => {
  applyTheme(isDaytime());
});

// Update theme when browser starts
chrome.runtime.onStartup.addListener(() => {
  applyTheme(isDaytime());
});

// Check and update theme every hour
chrome.alarms.create("themeCheck", { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "themeCheck") {
    applyTheme(isDaytime());
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
      applyTheme(isDaytime());
    } else {
      chrome.storage.local.set({ forceMode: newForceMode });
      applyTheme(newForceMode === 'day');
    }
  });
});
