import puppeteer from "puppeteer";
import fs from 'node:fs';

const urls = fs.readFileSync('./url_list/sslv_list.txt', 'utf8').split("\r\n");


(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
  
    // Navigate the page to a URL
    await page.goto('https://ss.lv');
  
    // Set screen size
    await page.setViewport({width: 1080, height: 720});

    for (var url of urls){
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

    await page.goto('https://www.ss.lv/lv/show-selected/fDgReF4S.html', {waitUntil: "networkidle0"});

    var data = await page.evaluate(() => {

        var all_data = [];

        var sections = document.querySelectorAll("tr[id=head_line]");

        for (var section of sections){
            var has_detailed_address = (section.children[1].innerHTML == "Iela" || section.children[1].innerHTML == "Ciems")
            var base_address = section.children[0].innerHTML.split(" : ").filter(e => e!= "Mājas, vasarnīcas").join(", ");

            var parent = section.parentNode;

            for (var i=1; i<parent.childElementCount; i++){

                var return_data = {};

                var data_parent = parent.children[i];
                var data_nodes = data_parent.children;

                return_data['url'] = data_nodes[1].firstChild.href;

                var image_url_parts = data_nodes[1].firstChild.firstChild.src.split("/");
                var [last, ...image_1] = [image_url_parts.pop(), image_url_parts.join("/")];
                var image_2 = return_data['url'].split("/").slice(6, -1).join("-");

                return_data['image'] = image_1+"/"+image_2+"-"+last.replace("th2", "800");

                //skatoties ir vai nav taa sekcija, maina datu atrasanas vietu
                if (has_detailed_address){
                    return_data['address'] = [base_address, data_nodes[3].firstChild.innerHTML.replace("<br>", ", ").replace(/(<b>)|(<\/b>)/g, "")].join(", ");
                    return_data['prop_size'] = data_nodes[4].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "") + " m²";
                    return_data['lot_size'] = data_nodes[7].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "");
                    return_data['price'] = data_nodes[8].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "").replace("  ", " ");
                } else {
                    return_data['address'] = base_address;
                    return_data['prop_size'] = data_nodes[3].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "") + " m²";
                    return_data['lot_size'] = data_nodes[6].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "");
                    return_data['price'] = data_nodes[7].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "").replace("  ", " ");

                }

                all_data.push(return_data)
                
            }
        }

        return all_data;
    });

    await page.close();
    await browser.close();
  })();