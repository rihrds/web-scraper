import puppeteer from "puppeteer";
import fs from 'node:fs';

//for city24
const base_query="https://api.city24.lv/lv_LV/search/realties?address[cc]=2&tsType=sale&unitType=House&adReach=1";
const useful_data = ["main_image", "price", "property_size", "lot_size"];
const udata_to_db = {"main_image": "image", "price":"price", "property_size": "prop_size", "lot_size":"lot_size"}
const address_data = ["county_name", "parish_name", "city_name", "district_name", "street_name"];
const ITEMS_PER_PAGE = 50;

//for ss
const urls = fs.readFileSync('./url_list/sslv_list.txt', 'utf8').split("\r\n");

//sistema: image, price, prop_size, lot_size, url, address, pub_date


var export_funcs = {
    search:async function search_city24(json) {
        var query = build_search_query(json);
        console.log(query)
        var data = await get_data_city24(query);
        if (typeof data === "string"){
            return data
        }
        var processed_data = process_data_city24(data);
        return processed_data;
    },
    get_house_count:async function get_house_count(){
        var req = await fetch("https://api.city24.lv/lv_LV/search/count?address%5Bcc%5D=2&tsType=sale&unitType=House", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
    
        var data = await req.json();
        return data[1].count
    },
    search_sslv:async function search_sslv(){
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

        await page.goto('https://www.ss.lv/lv/show-selected/fDgReF4S.html');

        var data = await page.evaluate(() => {

            var all_data = [];

            var sections = document.querySelectorAll("tr[id=head_line]");

            for (var section of sections){
                var base_address = section.children[0].innerHTML.split(":").slice(-2).map(e => e.trim()).join(", ");

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

                    return_data['address'] = [base_address, data_nodes[3].firstChild.innerHTML.replace("<br>", ", ").replace(/(<b>)|(<\/b>)/g, "")].join(", ");
                    
                    return_data['prop_size'] = data_nodes[4].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "") + " m²";

                    return_data['lot_size'] = data_nodes[7].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "");

                    return_data['price'] = data_nodes[8].firstChild.innerHTML.replace(/(<b>)|(<\/b>)/g, "").replace("  ", " ");

                    all_data.push(return_data)
                    
                }
            }

            return all_data;
        });

        await page.close();
        await browser.close();

        console.log(data)
    }

}


function build_search_query(data){
    //convert data object to get request
    let query = base_query;
    for (const key in data){
        query += `&${key}=${data[key]}`;
    }
    query+="&itemsPerPage="+ITEMS_PER_PAGE;
    return query;
}

async function get_data_city24(search_query){
    //query city24.lv api
    var req = await fetch(search_query, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })

    var data = await req.json();

    if (Object.entries(data).length === 0){
        return "Neko neatradām ar šiem kritērijiem :(";
    }

    var seperate = [];

    for (var i=0; i<Math.min(Object.keys(data).length, ITEMS_PER_PAGE);i++) seperate.push(data[i]);
    return seperate;
}

function process_data_city24(data){
    //only take the useful data from response
    for (var i=0; i<data.length; i++){

        var return_data = {};
        useful_data.forEach((param) => {(data[i][param]!= null) ? return_data[udata_to_db[param]]=data[i][param] : return_data[udata_to_db[param]]="???"});

        //extract url from main_image value and replace placeholder {fmt:em} with the resolution
        //catch ir tad, ja nav bildes
        try{
            return_data["image"] = return_data["image"]["url"].replace("{fmt:em}", "13");
        }
        catch{ 
            return_data["image"] = "https://www.city24.lv/assets/img/placeholder/object_placeholder.46f176b8.svg"
        }
        return_data["url"] = "https://www.city24.lv/real-estate/houses-for-sale/a/" + data[i]["friendly_id"]; //tas a ir vienkarsi vajadzigs
        // return_data["pub_date"] = Date.parse(data[i]["date_published"]);

        //add unit of measure to values
        if (data[i]["lot_size_unit_id"] == 1){
            return_data["lot_size"] += "m²"
        } else if (data[i]["lot_size_unit_id"] == 5) {
            return_data["lot_size"] += "ha"
        }
        return_data["prop_size"] += "m²"
        return_data["price"] += "€"


        var address = [];
        address_data.forEach((param) => { if(data[i]["address"][param]!= null) address.push(data[i]["address"][param])});

        return_data["address"] = address.join(", ");

        data[i] = return_data;
    }
    return data
}

export default export_funcs;