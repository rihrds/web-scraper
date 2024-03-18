const jsdom = require("jsdom");

async function get_data_sslv(search_query){
    var req = await fetch("https://www.ss.lv/lv/real-estate/homes-summer-residences/valka-and-reg/rss/", {
        method: 'GET',
        headers: {
            'Accept': 'application/xml',
        },
    });

    var data = await req.text();
    return data;
}

function process_data_sslv(data){
    const dom = new jsdom.JSDOM("");
    const DOMParser = dom.window.DOMParser;
    const parser = new DOMParser;
    const xml_doc = parser.parseFromString(data, "text/xml");

    var items = Array.from(xml_doc.getElementsByTagName("item"));
    console.log(items);

    items.forEach(item => {
        console.log(item.textContent);
    })
}

async function do_all(){
    var dat = await get_data_sslv();
    process_data_sslv(dat);
}
do_all();