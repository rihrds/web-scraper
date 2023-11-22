//TODO figure out address

//Only this is important, now need to figure out the importance of each
/*
county_name: 'Rēzeknes nov.',
    parish_name: 'Čornajas pag.',
    city_name: null,
    district_name: null,
    street_name: 'Bērzkalniņi'
*/

const { default: puppeteer } = require("puppeteer");

const base_query="https://api.city24.lv/lv_LV/search/realties?tsType=sale&unitType=House&adReach=1&itemsPerPage=50&page=1";

const useful_data = ["main_image", "price", "property_size", "lot_size"];


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


function build_search_query(json_data){
    //convert json data to get request
    let query = base_query;
    for (const key in json_data){
        query += `&${key}=${json_data[key]}`;
    }
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

    //Put each house's data as a seperate list item
    seperate = [];

    for (var i=0; i<Math.min(Object.keys(data).length, 5);i++) seperate.push(data[i]);
    return seperate;
}

function process_data(data){
    console.log(data.length);
    //only take the useful data from response
    for (var i=0; i<data.length; i++){
        var return_data = {};
        useful_data.forEach((param) => {return_data[param]=data[i][param]});
        //extract url from main_image value and replace placeholder {fmt:em} with the resolution
        return_data["main_image"] = return_data["main_image"]["url"].replace("{fmt:em}", "13");
        data[i] = return_data;
    }
    return data
}
    //main_image, slogans, price, property_size, lot_size, room_count, attributes => TOTAL_FLOORS, CONDITION, NUMBER_OF_BEDROOMS, BUILDING_MATERIAL, CONSTRUCTION_YEAR, ROOF_TYPE, HEATING_SYSTEM, SECURITY, FURNITURE
    //kkas no adreses ar jasaprot
    //lot_size_unit_id 5=ha


    //MAJAS
    //https://api.city24.lv/lv_LV/search/realties?address%5Bcc%5D=2&address%5Bparish%5D%5B%5D=25459&tsType=sale&unitType=House&price%5Bgte%5D=6900&price%5Blte%5D=42000&size%5Bgte%5D=78&size%5Blte%5D=678&lotSize%5Bgte%5D=6789&lotSize%5Blte%5D=7890&roomCount=4%2C5%2B&totalFloors%5Bgte%5D=1&totalFloors%5Blte%5D=4&adReach=1&itemsPerPage=50&page=1

    //https://api.city24.lv/lv_LV/search/realties?
    //cena price[gte] price[lte]
    //unitType=House
    //majas platiiba size[gte] size[lte]
    //zemes platiiba lotSize[gte] size[lte]
    //istabu skaits roomCount=4,5+
    //stavu skaits totalFloors[gte] totalFloors[lte]
    //page=1
    //adrese jaatsketina address[cc]=2&address[parish][]=25459
    //itka obligati: tsType=sale&unitType=House&adReach=1&itemsPerPage=50&page=1