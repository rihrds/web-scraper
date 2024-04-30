import sqlite3 from 'sqlite3';
import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.resolve(__dirname, "./database.db"));
const helper_location = path.resolve(__dirname, './../helper.js');
console.log(helper_location);
var helper = await import("file://"+helper_location);
helper = helper["default"];

const results_per_page = 20;
//for city24.lv
const ITEMS_PER_PAGE = 50;

function create_db() {
    db.serialize(async () => {
    //make all this run only if database doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS sludinajumi (
            image varchar(255),
            price int,
            prop_size int,
            lot_size int,
            lot_size_unit varchar(255),
            url varchar(255),
            region varchar(255),
            address varchar(255)
    ) `);
    
    const stmt = db.prepare("INSERT INTO sludinajumi (image, price, prop_size, lot_size, lot_size_unit, url, region, address) VALUES ($image, $price, $prop_size, $lot_size, $lot_size_unit, $url, $region, $address)");
    var house_count = await helper.get_house_count();
    
    //city24
    /*var other_count = house_count%ITEMS_PER_PAGE;
    var loop_count = (house_count-other_count)/ITEMS_PER_PAGE;
    
    for (var i=1; i<=loop_count; i++){
        console.log(`page ${i}`)
        var slud = await helper.search_city24({ page:  i.toString()});
        for (item=0; item<50; item++){
            stmt.run(slud[item]);
        }
    }
    var slud = await helper.search_city24({ page:  (loop_count+1).toString()});
    for (var item=0; item<other_count; item++){
        stmt.run(slud[item]);
    }*/

    //ss_lv
    console.log("Started from ss_lv");
    var slud = await helper.search_sslv();
    console.log("Got from ss_lv");
    for (var item=0; item<Object.keys(slud).length; item++){
        stmt.run(Object.values(slud[item]));
    }
})};

var export_funcs = {
    retrieve_data:function retrieve_data(conds) {

        var query = "SELECT * FROM sludinajumi "
        if (conds){
            query += "WHERE "
        }
    
        var poss_conds = ["$min_price", "$max_price", "$min_prop_size", "$max_prop_size", "$min_lot_size", "$max_lot_size", "$region"]
        var conversion = {"$min_price":"price >= $min_price", "$max_price":"price <= $max_price", "$min_prop_size":"prop_size >= $min_prop_size", "$max_prop_size":"prop_size <= $max_prop_size", "$min_lot_size":"lot_size >= $min_lot_size", "$max_lot_size":"lot_size <= $max_lot_size", "$region":"region LIKE '%' || $region || '%'"}
        var query_add_parts = [];
        var curr_page = 0;
        for (var key of Object.keys(conds)){
            if (poss_conds.includes(key) && key != "$page"){
                query_add_parts.push(conversion[key]);
            } else if (key == "$page"){
                curr_page = conds[key];
                delete conds[key]
            }
        }
    
        query += "(" + query_add_parts.join(" AND ") + ")";
        if (Object.keys(conds).includes("prop_size")){
            query += " OR ( prop_size = '???' AND " + query_add_parts.filter(n => !n.includes("prop_size")).join(" AND ") + ")"
        }
        if (Object.keys(conds).includes("lot_size")){
            query += " OR ( lot_size = '???' AND " + query_add_parts.filter(n => !n.includes("lot_size")).join(" AND ") + ")"
        }
        query += ` ORDER BY price ASC LIMIT ${results_per_page} OFFSET ${((curr_page*results_per_page)-results_per_page)};`;

        //add order by based on user input
        console.log(query);
    
        return new Promise((resolve, reject) => {
            db.serialize( () => {
                const stmt = db.prepare(query);
                stmt.all(conds, (err, rows) => {
                    resolve(rows);
                });
            });
        });
    }
}

export default export_funcs;

create_db();