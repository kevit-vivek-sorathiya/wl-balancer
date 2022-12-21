#!/usr/bin/env node
const puppeteer = require("puppeteer");
const path = require("path");
const axios = require("axios");
const dayjs = require("dayjs");
const figlet = require("figlet");
const cron = require("node-cron");
const wallpaper = require("wallpaper");

const config = {
  email: "keka email",
  password: "*******",
  authToken: "8H473XXXXXXXXXXXXXXXXXXXXXX764H4G3",
}

async function getAuthToken() {
  const browser = await puppeteer.launch({ headless: true });
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
  const today = data.find(timer => new Date(timer?.attendanceDate).toISOString() === new Date(dayjs().format('YYYY-MM-DD')).toISOString())
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

let time, data;

function setTime() {
  let total = 8.5;
  const workedTime = calculateDuration(data);
  if (workedTime) total -= workedTime;
  let decimal = total - Math.floor(total)
  let abs = Math.floor(total)
  let min = decimal * 60

  time = abs + "h" + " " + (Math.floor(min)).toFixed(0) + "m " + ((min - Math.floor(min)) * 60).toFixed(0) + "s"
  return total
}

async function main() {
  const authToken = await getAuthToken();
  data = await getData(authToken);

  setInterval((async () => {
    const hrs = setTime()
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.moveCursor(0, -1); // up one line
    // process.stdout.clearLine(1);
    // process.stdout.cursorTo(0);
    // process.stdout.write(
    //     figlet.textSync(
    //       str
    //   )
    // );

    if (hrs <= 0) {
      //handle timeout case here
    }
  }), 1000);

  const browser = await puppeteer.launch({
    headless: true,
      ignoreHTTPSErrors: true,
      args: [`--window-size=1920,1080`],
      defaultViewport: {
        width:1920,
        height:1080
      }
  })
  const page = await browser.newPage()
  await page.goto(path.join(__dirname, './index.html'))
  setInterval(async () => {
    if (time?.trim() !== '8h 30m 0s') {
      await page.evaluate((time) => document.querySelector('.text').innerHTML = time, time);
      await setWallpaper(page)
    }
  }, 500)


  cron.schedule('15 15 * * *', async () => {
    const authToken = await getAuthToken()
    data = await getData(authToken)
  })
}

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getColor(remaining) {
  if (remaining > 5) return "red";
  else if (remaining > 3) return "redBright";
  else if (remaining > 1) return "yellow";
  else return "green";
}

async function setWallpaper(page) {
  await page.screenshot({
    path: 'ss.png'
  })
  await wallpaper.set('./ss.png')
}

main().then().catch(e => console.log(e))
