import sqlite3 from 'sqlite3';
const db = new sqlite3.Database("./database.db");
import helper from './../helper.js';

const ITEMS_PER_PAGE = 50;

/*db.serialize(async () => {
    //make all this run only if database doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS sludinajumi (
            image varchar(255),
            price int,
            prop_size int,
            lot_size int,
            lot_size_unit varchar(255),
            url varchar(255),
            address varchar(255)
    ) `);
    
    const stmt = db.prepare("INSERT INTO sludinajumi (image, price, prop_size, lot_size, lot_size_unit, url, address) VALUES ($image, $price, $prop_size, $lot_size, $lot_size_unit, $url, $address)");
    var house_count = await helper.get_house_count();
    
    //city24
    var other_count = house_count%ITEMS_PER_PAGE;
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
    }

    //ss_lv
    console.log("Started from ss_lv");
    var slud = await helper.search_sslv();
    console.log("Got from ss_lv");
    for (item=0; item<Object.keys(slud).length; item++){
        stmt.run(Object.values(slud[item]));
    }
})*/

function retrieve_data(conds) {

    var query = "SELECT * FROM sludinajumi "
    if (conds){
        query += "WHERE "
    }

    console.log(Object.keys(conds))

    var poss_conds = ["$min_price", "$max_price", "$min_prop_size", "$max_prop_size", "$min_lot_size", "$max_lot_size", "$address"]
    var conversion = {"$min_price":"price >= $min_price", "$max_price":"price <= $max_price", "$min_prop_size":"prop_size >= $min_prop_size", "$max_prop_size":"prop_size <= $max_prop_size", "$min_lot_size":"lot_size >= $min_lot_size", "$max_lot_size":"lot_size <= $max_lot_size", "$address":"address LIKE '%' || $address || '%'"}
    var query_add_parts = []
    for (var key of Object.keys(conds)){
        console.log(key)
        if (poss_conds.includes(key)){
            query_add_parts.push(conversion[key]);
        }
    }

    query += query_add_parts.join(" AND ");
    console.log(query);

    //also add tht fields can equal ???

    db.serialize( () => {
        const stmt = db.prepare(query);
        stmt.all(conds, (err, rows) => {
            console.log(rows)
        });
    });
}

retrieve_data({"$min_price": 2800000, "$max_price":2800000, "$min_prop_size":400, "$max_prop_size":10000000000});
