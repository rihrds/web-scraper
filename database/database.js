import sqlite3 from 'sqlite3';
const db = new sqlite3.Database("test.db");
import helper from './../helper.js';

const ITEMS_PER_PAGE = 50;

//sistema: image, price, prop_size, lot_size, url, address (pub_date is removed)
//KKADS RANDOM-ASS ERRORS SQLITE_RANGE

db.serialize(async () => {
    //make all this run only if database doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS sludinajumi (
            main_image varchar(255),
            price int,
            property_size varchar(255),
            lot_size varchar(255),
            listing varchar(255),
            address varchar(255)
    ) `);
    
    const stmt = db.prepare("INSERT INTO sludinajumi (main_image, price, property_size, lot_size, listing, address) VALUES (?, ?, ?, ?, ?, ?)");
    var house_count = await helper.get_house_count();
    
    var other_count = house_count%ITEMS_PER_PAGE;
    var loop_count = (house_count-other_count)/ITEMS_PER_PAGE;
    
    for (var i=1; i<=loop_count; i++){
        console.log(`page ${i}`)
        var slud = await helper.search_city24({ page:  i.toString()});
        for (item=0; item<50; item++){
            stmt.run(Object.values(slud[item]));
        }
    }
    var slud = await helper.search_city24({ page:  (loop_count+1).toString()});
    for (var item=0; item<other_count; item++){
        stmt.run(Object.values(slud[item]));
    }
})