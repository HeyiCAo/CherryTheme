// Klein Blue RGB: [0, 47, 167] or hex #002FA7
// White RGB: [255, 255, 255]

const KLEIN_BLUE = [0, 47, 167];
const WHITE = [255, 255, 255];

// Cache for current theme state
let isDayMode = true;

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
  isDayMode = isDay;
  const theme = getThemeColors(isDay);
  if (chrome.theme && chrome.theme.update) {
    chrome.theme.update(theme);
    console.log(`Theme applied: ${isDay ? 'Day (White)' : 'Night (Klein Blue)'}`);
  } else {
    console.warn('chrome.theme API is not available');
  }
}

// Listen for Chrome theme changes (light/dark mode)
chrome.management.onEnabled.addListener((info) => {
  // Check if it's the extension itself being enabled
  if (info.id === chrome.runtime.id) {
    checkSystemThemeAndApply();
  }
});

// Use a content script approach to detect system theme via CSS media query
async function checkSystemThemeAndApply() {
  try {
    // Create an offscreen document to check media query
    if (chrome.offscreen) {
      // Check if offscreen document already exists
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [chrome.runtime.getURL('offscreen.html')]
      });
      
      if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['DOM_PARSER'],
          justification: 'Check system color scheme preference'
        });
      }
      
      // Send message to offscreen document to check theme
      chrome.runtime.sendMessage({ type: 'CHECK_THEME' });
    } else {
      // Fallback: use time-based detection
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      applyTheme(isDay);
    }
  } catch (e) {
    console.error('Error checking system theme:', e);
    // Fallback to time-based
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    applyTheme(isDay);
  }
}

// Listen for messages from offscreen document
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'THEME_RESULT') {
    applyTheme(message.isDay);
  }
  return true;
});

// Initial theme application
chrome.runtime.onInstalled.addListener(() => {
  checkSystemThemeAndApply();
});

// Update theme when browser starts
chrome.runtime.onStartup.addListener(() => {
  checkSystemThemeAndApply();
});
