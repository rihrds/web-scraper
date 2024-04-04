const jsdom = require("jsdom");

const base_query="https://api.city24.lv/lv_LV/search/realties?address[cc]=2&tsType=sale&unitType=House&adReach=1";

const useful_data = ["main_image", "price", "property_size", "lot_size"];
const udata_to_db = {"main_image": "image", "price":"price", "property_size": "prop_size", "lot_size":"lot_size"}
const address_data = ["county_name", "parish_name", "city_name", "district_name", "street_name"];
const ITEMS_PER_PAGE = 50;

//sistema: image, price, prop_size, lot_size, url, address, pub_date


module.exports = {
    search:async function search(json) {
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
    
        data = await req.json();
        return data[1].count
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

    data = await req.json();

    if (Object.entries(data).length === 0){
        return "Neko neatradām ar šiem kritērijiem :(";
    }

    seperate = [];

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
        return_data["pub_date"] = Date.parse(data[i]["date_published"]);

        //add unit of measure to values
        if (data[i]["lot_size_unit_id"] == 1){
            return_data["lot_size"] += "m²"
        } else if (data[i]["lot_size_unit_id"] == 5) {
            return_data["lot_size"] += "ha"
        }
        return_data["prop_size"] += "m²"
        return_data["price"] += "€"


        address = [];
        address_data.forEach((param) => { if(data[i]["address"][param]!= null) address.push(data[i]["address"][param])});

        return_data["address"] = address.join(", ");

        data[i] = return_data;
    }
    return data
}

async function get_data_sslv(search_query){
    var req = await fetch(search_query, {
        method: 'GET',
        headers: {
            'Accept': 'application/xml',
        },
    });

    data = await req.text();

    const dom = new jsdom.JSDOM("");
    const DOMParser = dom.window.DOMParser;
    const parser = new DOMParser;
    const xml_doc = parser.parseFromString(data, "text/xml");

    return xml_doc;
}