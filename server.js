const express = require('express');
const puppeteer = require('puppeteer');
const userAgentParser = require('ua-parser-js');

const app = express();
const PORT = 3000;
const TARGET_URL = 'https://dev.chinamarket.cn'; // 商城地址

// 判断是否为搜索引擎爬虫
function isBot(userAgent) {
  const ua = userAgentParser(userAgent);
  return /bot|crawler|spider|crawling/i.test(userAgent) || ua.device.type === undefined;
}

// 渲染 HTML 页面
async function renderPage(url) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  const html = await page.content();
  await browser.close();
  return html;
}

app.use(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const fullUrl = `${TARGET_URL}${req.url}`;

  if (!isBot(userAgent)) {
    // 非爬虫请求，正常跳转前端地址
    return res.redirect(fullUrl);
  }

  try {
    console.log(`📡 Bot request: ${req.url}`);
    const html = await renderPage(fullUrl);
    res.send(html);
  } catch (err) {
    console.error('❌ Render error:', err);
    res.status(500).send('Render failed');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SEO middle layer running at http://localhost:${PORT}`);
});
