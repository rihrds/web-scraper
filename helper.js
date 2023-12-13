const base_query="https://api.city24.lv/lv_LV/search/realties?address[cc]=2&tsType=sale&unitType=House&adReach=1";

const useful_data = ["main_image", "price", "property_size", "lot_size"];
const address_data = ["county_name", "parish_name", "city_name", "district_name", "street_name"];
const ITEMS_PER_PAGE = 20;


module.exports = {
    search:async function search(json) {
        var query = build_search_query(json);
        var data = await get_data(query);
        if (typeof data === "string"){
            return data
        }
        var processed_data = process_data(data);
        return processed_data;
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

async function get_data(search_query){
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

function process_data(data){
    //only take the useful data from response
    for (var i=0; i<data.length; i++){

        var return_data = {};
        useful_data.forEach((param) => {(data[i][param]!= null) ? return_data[param]=data[i][param] : return_data[param]="???"});

        //extract url from main_image value and replace placeholder {fmt:em} with the resolution
        return_data["main_image"] = return_data["main_image"]["url"].replace("{fmt:em}", "13");
        return_data["listing"] = "https://www.city24.lv/real-estate/houses-for-sale/a/" + data[i]["friendly_id"]; //tas a ir vienkarsi vajadzigs


        address = [];
        address_data.forEach((param) => { if(data[i]["address"][param]!= null) address.push(data[i]["address"][param])});

        return_data["address"] = address;

        data[i] = return_data;
    }
    return data
}