let Parser = require('rss-parser');
let parser = new Parser();

const useful_data = ["Zem. pl.", "m2", "Cena"];
const address_data = ["Pilsēta", "Pagasts", "Ciems", "Iela"]
//conversion table
const udata_to_db = {"Cena": "price", "Zem. pl.": "lot_size", "m2": "prop_size"};

//JAPARTAISA LAI SKRAPE KATRU LAPU JO SS IR VIENKARSI TIK FANTASTISKS

(async () => {
    let feed = await parser.parseURL('https://www.ss.lv/lv/real-estate/homes-summer-residences/jurmala/sell/rss/');

    data = [];

    feed.items.forEach(item => {
        var return_data = {};
        return_data["url"] = item.link;
        return_data["pub_date"] = Date.parse(item.pubDate); 

        image_url = item.content.split("src=\"")[1].split("\"")[0].split("/");
        var [name, url] = [image_url.pop(), image_url.join("/")]
        return_data['image'] = url + "/" + item.link.split("/").slice(-4, -1).join("-") + "-" + name.split(".")[0] + ".800.jpg";
        
        console.log(item)

        var cSnippet = item.contentSnippet.split("\n").filter(e => e.includes(": ")).join(": ") //hacks bet strada, vajadzetu gan nomainit velak
        cSnippet = cSnippet.split(": ").filter(e => e!==": " && e!== undefined);

        let csarr = {};


        for (let i = 0; i < cSnippet.length-1; i += 2) {
            csarr[cSnippet[i]] = cSnippet[i+1]
        }

        useful_data.forEach(e => {
            if (csarr[e] != null){
                return_data[udata_to_db[e]] = csarr[e].replace(/[ ,]/g, "");
                delete csarr[e]
            } else {
                return_data[udata_to_db[e]] = "???"
            }
        });

        address = []


        address_data.forEach(e => {
            if (csarr[e] != null){
                address.push(csarr[e]);
            }
        });

        return_data["address"] = address.join(", ")

        //pilseta, pagasts, ciems, iela

        return_data["prop_size"] += "m²"
        console.log(return_data)
        data.push(return_data);
    });

    //console.log(data)
})();