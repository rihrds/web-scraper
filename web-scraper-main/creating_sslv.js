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

    data = [];

    items.forEach(item => {
        return_data = {};
        nodes = item.childNodes;
        //console.log(nodes[1].textContent);
        return_data["listing"] = nodes[3].textContent; //sludinajuma adrese
        return_data["date"] = Date.parse(nodes[5].textContent); //publicesanas datums
        arr = nodes[7].textContent.split("<br")
        arr.forEach( (e, i) => {arr[i] = e.replace("/>", "")})
        arr = arr.filter(n => n); //parejais info
        console.log(arr)
        data.push(return_data);
    })

    //console.log(data);
}

async function do_all(){
    var dat = await get_data_sslv();
    process_data_sslv(dat);
}
do_all();