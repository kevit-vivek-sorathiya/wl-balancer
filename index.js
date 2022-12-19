#!/usr/bin/env node
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const axios = require("axios");
const dayjs = require("dayjs");
const figlet = require("figlet");

const config = {
  email: "keka email",
  password: "*******",
  authToken: "8H473XXXXXXXXXXXXXXXXXXXXXX764H4G3",
}

async function getAuthToken() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://kevit.keka.com/#/me/attendance/logs");
  await page.waitForSelector(
    "#login-container-center > div > div > div.form-group > form > button.btn.btn-danger.btn-login.btn-keka-login"
  );
  await page.click(
    "#login-container-center > div > div > div.form-group > form > button.btn.btn-danger.btn-login.btn-keka-login"
  );
  await page.click(
    "#login-container-center > div > div > div.form-group > form > button.btn.btn-danger.btn-login.btn-keka-login"
  );
  await sleep(2000);
  await page.waitForSelector("#email");
  await page.type("#email", config.email);
  await sleep(2000);
  await page.type("#password", config.password);
  await sleep(2000);
  await page.keyboard.press("Enter");
  await sleep(3000);
  await page.goto("https://kevit.keka.com/#/me/attendance/logs");
  await page.goto("https://kevit.keka.com/#/me/attendance/logs");
  return page.evaluate(() => localStorage.getItem("access_token"));
}
async function getData(token) {
  let res = await axios.get(
    "https://kevit.keka.com/k/attendance/api/mytime/attendance/summary",
    {
      headers: {
        authorization: `Bearer ${config.authToken}`
      }
    }
  );
  if (res.status !== 200) {
    res = await axios.get(
      "https://kevit.keka.com/k/attendance/api/mytime/attendance/summary",
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    );
  }
  return res?.data;
}

function calculateDuration(data) {
  const today = data?.reverse()[0];
  const validInOutPairs = today?.validInOutPairs;
  const current = dayjs();
  let workedTime = 0;
  if (!validInOutPairs?.length) {
    if (!today.timeEntries[0]) console.log("No entries");
    else {
      workedTime = current.diff(today.timeEntries[0]?.timestamp, "hours", true);
    }
  } else if (validInOutPairs?.length === 1) {
    workedTime = validInOutPairs[0]?.totalDuration;
    if (today.timeEntries[2]) {
      workedTime += current.diff(
        today.timeEntries[2]?.timestamp,
        "hours",
        true
      );
    }
  } else {
    validInOutPairs?.forEach((pair) => {
      workedTime += pair?.totalDuration;
    });
  }
  return workedTime;
}

(async () => {
  const authToken = await getAuthToken();
  setInterval(async () => {
    const data = await getData(authToken);
    const workedTime = calculateDuration(data);
    let total = 8.5;
    if (workedTime) total -= workedTime;
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1);
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1);
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1);
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1);
    process.stdout.moveCursor(0, -1); // up one line
    process.stdout.clearLine(1);
    process.stdout.cursorTo(0);
    process.stdout.write(
      chalk[getColor(total)](
        figlet.textSync(
          total.toFixed(2) + " h" + "  " + (total * 60).toFixed(2) + " m"
        )
      )
    );
    if (total <= 0) {
      //handle timeout case here
    }
  }, 5000);
})();

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getColor(remaining) {
  if (remaining > 5) return "red";
  else if (remaining > 3) return "redBright";
  else if (remaining > 1) return "yellow";
  else return "green";
}