import puppeteer from "puppeteer";
import fs from 'node:fs';

const data = fs.readFileSync('./url_list/sslv_list-temp.txt', 'utf8').split("\r\n");


(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
  
    // Navigate the page to a URL
    await page.goto('https://ss.lv');
  
    // Set screen size
    await page.setViewport({width: 1080, height: 720});

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

    await page.goto('https://www.ss.lv/lv/show-selected/fDgReF4S.html');

    await page.evaluate(() => {
        var sections = document.querySelectorAll("tr[id=head_line]");

        for (var section of sections){
            var base_address = section.children[0].innerHTML.split(":").slice(-2).map(e => e.trim()).join(", ");

            var parent = section.parentNode;

            for (var i=1; i<parent.childElementCount; i++){
                var data_parent = parent.children[i];
                var data_nodes = data_parent.children;

                var url = data_nodes[1].firstChild.href;

                var image_url_parts = data_nodes[1].firstChild.firstChild.src.split("/");
                var [last, ...image_1] = [image_url_parts.pop(), image_url_parts.join("/")];
                var image_2 = url.split("/").slice(6, -1).join("-");

                var image = image_1+"/"+image_2+"-"+last.replace("th2", "800");

                var address = [base_address, data_nodes[3].firstChild.innerHTML.replace("<br>", ", ").replace(/(<b>)|(<\/b>)/g, "")].join(", ");
            }
        }
    })
  })();