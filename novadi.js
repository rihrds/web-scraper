//reali izbesos ar sito jo city24.lv izdomaja ka eksiste ~70 novadi, kas vairs nepastav un visiem novadiem ir kkadi id nevis nosaukumi meklesana

const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var dict = {}

    // Navigate the page to a URL
    for (var i=25000; i<25119; i++){
        await page.goto("https://www.city24.lv/real-estate-search/land-lots-for-sale/sejas-nov/id="+i.toString()+"-county", { waitUntil: 'networkidle0' });
        const data = await page.evaluate(() => document.querySelector('*').outerHTML);

        let index = data.indexOf("Pārdod zemi");
        let novads = data.substring(index, index+50);
        index = novads.indexOf("-");
        novads = novads.substring(index+2, index+30);
        index = novads.indexOf("-");
        novads = novads.substring(0, index-1);

        dict[i] = novads
        
    }

    var novadi = []
    for (const [key, value] of Object.entries(dict)){
        novadi.push(value);
    }
    novadi.sort();

    for (var i in novadi){
        console.log(`<option value="${Object.keys(dict).find(key => dict[key] === novadi[i])}">${novadi[i]}</option>`)
    }


    await browser.close();
})();