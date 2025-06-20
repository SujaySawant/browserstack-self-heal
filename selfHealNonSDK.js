// npm install webdriverio
const wdio = require('webdriverio');

const script = process.argv.slice(2)[0];
const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const timeStamp = new Date().getTime()

async function startDriver() {
  const capabilities = {
    'browserName': 'Chrome',
    'platformName': 'MAC',
    'bstack:options': {
      projectName: "AI SelfHeal",
      buildName: `SelfHeal ${script} ${timeStamp}`,
      sessionName: `Session ${script}`,
      debug: true,
      selfHeal: !script.includes('failed'),
      video: true
    },
  };

  const opts = {
    path: '/wd/hub',
    port: 443,
    hostname: 'hub.browserstack.com',
    protocol: 'https',
    user: username,
    key: accessKey,
    logLevel: 'silent',
    capabilities: capabilities,
    waitForTimeout: 240000,
    connectionRetryCount: 0,
    connectionRetryTimeout: 900000
  };

  let driver;

  try {
    driver = await wdio.remote(opts);
    const sessionId = await driver.sessionId;

    if (script.includes('setup')) {
      await driver.url('https://shashankg-gollapally.github.io/Automate_Selfheal_Pages/index.html');
      const dropdown = await driver.$('#page-selector');
      await dropdown.click();
      await driver.keys('Enter');
      const optionToSelect = await driver.$('option[value="old.html"]');
      await optionToSelect.click();
      const inputBox = await driver.$('input#username');
      await inputBox.setValue('test123');
      await driver.execute(`browserstack_executor: {
        "action": "setSessionStatus",
        "arguments": {
          "status": "passed"
        }
      }`);
    } else if (script.includes('healing')) {
      await driver.maximizeWindow();
      await driver.url('https://shashankg-gollapally.github.io/Automate_Selfheal_Pages/index.html');
      const dropdown = await driver.$('#page-selector');
      await dropdown.click();
      await driver.keys('Enter');
      const optionToSelect = await driver.$('option[value="new.html"]');
      await optionToSelect.click();
      const inputBox = await driver.$('input#username');
      await inputBox.setValue('test123');
      await driver.execute(`browserstack_executor: {
        "action": "setSessionStatus",
        "arguments": {
          "status": "passed"
        }
      }`);
    } else if (script.includes('failed')) {
      try {
        await driver.maximizeWindow();
        await driver.url('https://shashankg-gollapally.github.io/Automate_Selfheal_Pages/index.html');
        const dropdown = await driver.$('#page-selector');
        await dropdown.click();
        await driver.keys('Enter');
        const optionToSelect = await driver.$('option[value="new.html"]');
        await optionToSelect.click();
        const inputBox = await driver.$('input#username');
        await inputBox.setValue('test123');
      } catch (error) {
        console.error('Error during failed script flow:', error.message);
        await driver.execute(`browserstack_executor: {
          "action": "setSessionStatus",
          "arguments": {
            "status": "failed"
          }
        }`);
      }
    }
  } catch (err) {
    console.error('Unexpected error during driver setup or execution:', err.message);
    await driver.execute(`browserstack_executor: {
          "action": "setSessionStatus",
          "arguments": {
            "status": "failed",
            "reason": "Script Issue"
          }
        }`);
  } finally {
    if (driver) {
      await driver.deleteSession();
    }
  }
}

(async () => {
  await startDriver();
})();
