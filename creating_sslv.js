import puppeteer from "puppeteer";
import fs from 'node:fs';

const data = fs.readFileSync('./url_list/sslv_list.txt', 'utf8').split("\r\n");


(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
  
    // Navigate the page to a URL
    await page.goto('https://ss.lv');
  
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    for (var url of data){
        var p = 1;

        await page.goto(url, {waitUntil: "networkidle0"});
        while (true) {
            p++;
            var next_page_url = await page.evaluate(() => {
                for (const checkbox of document.querySelectorAll('input[type=checkbox')) {
                    if (!checkbox.checked) checkbox.click();
                }

                var next = document.querySelector('a[rel=next]')

                if (next) return next.href
                return ''
            });

            if (next_page_url == '' || next_page_url == url){
                break
            } else {
                await page.goto(url+"page"+p.toString()+".html", {waitUntil: "networkidle0"});
            }
        }
    }
  })();