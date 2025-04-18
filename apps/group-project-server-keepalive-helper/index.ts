import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as readlineSync from 'readline-sync';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

// Constants
const URL = 'https://dive.cs.cityu.edu.hk/cs5483_24b/user/group1/lab/workspaces/keepalive';
const REFRESH_INTERVAL = 1000 * 60 * 4; // 4 minutes in milliseconds
const COOKIES_FILE = path.join(__dirname, 'data/cookies.json');
const SELENIUM_REMOTE_URL = process.env.SELENIUM_REMOTE_URL || 'http://localhost:4444';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || ''; // Set your Discord webhook URL as an environment variable

// Store cookies in memory
let storedCookies: any[] = [];

// Helper function to get HKT formatted time
function getHKTime() {
  return new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
}

// Function to send message to Discord webhook
async function sendDiscordMessage(message: string) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('Discord webhook URL not set. Skipping notification.');
    return;
  }

  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
    });
    console.log('Discord notification sent successfully');
  } catch (error: any) {
    console.error('Failed to send Discord notification:', error.message);
  }
}

// Function to create and configure a new WebDriver instance
async function createDriver() {
  const chromeOptions = new Options().addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1600,900',
    '--headless=new' // uncomment this line to run in headless mode
  );

  return await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions as any)
    .usingServer(SELENIUM_REMOTE_URL)
    .build();
}

// Function to check server status
async function checkServerStatus(driver: WebDriver) {
  try {
    const h1Elements = await driver.findElements(By.css('h1'));
    let serverNotRunning = false;

    for (const h1 of h1Elements) {
      const text = await h1.getText();
      if (text.trim() === 'Server not running') {
        serverNotRunning = true;
        break;
      }
    }

    const status = serverNotRunning
      ? '🔴 Page refreshed. Server is NOT running'
      : '🟢 Page refreshed. Server is running';
    console.log(status);
    await sendDiscordMessage(`${status} at ${getHKTime()}`);
  } catch (error) {
    console.error('Error checking server status:', error);
    await sendDiscordMessage(`❌ Error checking server status: ${error}`);
    throw error;
  }
}

// Function to load cookies from file
function loadCookiesFromFile(): any[] {
  try {
    // Ensure the directory exists for cookies
    const cookiesDir = path.dirname(COOKIES_FILE);
    if (!fs.existsSync(cookiesDir)) {
      fs.mkdirSync(cookiesDir, { recursive: true });
    }

    if (fs.existsSync(COOKIES_FILE)) {
      console.log('Loading saved cookies from file...');
      const cookiesString = fs.readFileSync(COOKIES_FILE, 'utf8');
      const cookies = JSON.parse(cookiesString);
      if (cookies.length > 0) {
        sendDiscordMessage(`🍪 Loaded saved cookies at ${getHKTime()}`);
      }
      return cookies;
    }
  } catch (error) {
    console.error('Error loading cookies from file:', error);
    sendDiscordMessage(`❌ Error loading cookies from file: ${error}`);
  }
  return [];
}

// Function to save cookies to file
function saveCookiesToFile(cookies: any[]) {
  try {
    const cookiesDir = path.dirname(COOKIES_FILE);
    if (!fs.existsSync(cookiesDir)) {
      fs.mkdirSync(cookiesDir, { recursive: true });
    }
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('Cookies saved to file for future sessions.');
  } catch (error) {
    console.error('Error saving cookies to file:', error);
    sendDiscordMessage(`❌ Error saving cookies to file: ${error}`);
  }
}

// Function to handle the login process
async function handleLogin(driver: WebDriver, loginForm: WebElement) {
  try {
    console.log(
      'Login required. Please enter your credentials. You can detach from a container and leave it running using the CTRL-p CTRL-q key sequence.\nWhat is your username?'
    );
    await sendDiscordMessage(`⚠️ Login required at ${getHKTime()}`);

    const username = readlineSync.question('Username: ');
    const password = readlineSync.question('Password: ', {
      hideEchoBack: true,
    });

    await driver.findElement(By.css('input#username_input')).sendKeys(username);
    await driver.findElement(By.css('input#password_input')).sendKeys(password);
    await driver.findElement(By.css('input#login_submit')).click();

    await driver.wait(
      until.stalenessOf(loginForm),
      10000,
      'Timed out waiting for login to complete'
    );

    try {
      await driver.findElement(By.css('div#login-main'));
      console.error('Login failed. Please try again with correct credentials.');
      await sendDiscordMessage(`❌ Login failed at ${getHKTime()}. Retrying immediately...`);
      await driver.quit();
      return false;
    } catch (error) {
      console.log('Login successful!');
      await sendDiscordMessage(`✅ Login successful at ${getHKTime()}`);

      // Update cookies in memory and save to file
      storedCookies = await driver.manage().getCookies();
      saveCookiesToFile(storedCookies);

      await checkServerStatus(driver);
      return true;
    }
  } catch (error) {
    console.error('Error during login:', error);
    await sendDiscordMessage(`❌ Error during login: ${error}`);
    throw error;
  }
}

// Function to apply stored cookies to driver
async function applyCookiesToDriver(driver: WebDriver) {
  if (storedCookies.length > 0) {
    console.log('Applying stored cookies...');
    await driver.manage().deleteAllCookies();

    for (const cookie of storedCookies) {
      if (cookie.domain) {
        await driver.manage().addCookie(cookie);
      }
    }
    await driver.navigate().refresh();
    return true;
  }
  return false;
}

// Function to check login status and handle login if needed
async function checkAndHandleLogin(driver: WebDriver) {
  try {
    console.log(`Refreshing page at ${getHKTime()}...`);
    await driver.get(URL);

    // Apply stored cookies if available
    if (storedCookies.length > 0) {
      await applyCookiesToDriver(driver);
    }

    try {
      const loginForm = await driver.wait(
        until.elementLocated(By.css('div#login-main')),
        5000,
        'Login form not found - already logged in'
      );

      const loginSuccess = await handleLogin(driver, loginForm);
      if (!loginSuccess) {
        return await checkAndHandleLogin(driver); // Retry login
      }
    } catch (error) {
      console.log('Already logged in.');
      await checkServerStatus(driver);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    await sendDiscordMessage(`❌ An error occurred: ${error}`);
    throw error;
  }
}

// Main function
async function main() {
  console.log('Starting group-project-server-keepalive-helper...');
  console.log(`Using Selenium server at: ${SELENIUM_REMOTE_URL}`);

  let driver: WebDriver | null = null;

  try {
    // Load cookies from file at startup
    storedCookies = loadCookiesFromFile();

    // Create a single driver instance
    driver = await createDriver();

    // Initial login check
    await checkAndHandleLogin(driver);

    // Set up interval to refresh the page
    setInterval(async () => {
      try {
        if (driver) {
          await checkAndHandleLogin(driver);
        }
      } catch (error) {
        console.error('Error during page refresh:', error);
        await sendDiscordMessage(`❌ Error during page refresh: ${error}`);
      }
    }, REFRESH_INTERVAL);

    console.log(`Page will be refreshed every ${REFRESH_INTERVAL / 1000 / 60} minutes.`);
    await sendDiscordMessage(
      `🤖 Bot started. Page will be refreshed every ${REFRESH_INTERVAL / 1000 / 60} minutes.`
    );
  } catch (error) {
    console.error('An error occurred:', error);
    await sendDiscordMessage(`❌ An error occurred: ${error}`);
    process.exit(1);
  }

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await sendDiscordMessage(`🛑 Bot shutting down at ${getHKTime()}`);
    if (driver) {
      await driver.quit();
    }
    process.exit(0);
  });
}

// Start the application
main().catch(console.error);
