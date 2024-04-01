const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("test.db");
const helper = require('./../helper.js');

ITEMS_PER_PAGE = 50;

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
    
    for (i=1; i<=loop_count; i++){
        console.log(`page ${i}`)
        var slud = await helper.search({ page:  i.toString()});
        for (item=0; item<50; item++){
            stmt.run(Object.values(slud[item]));
        }
    }
    var slud = await helper.search({ page:  (loop_count+1).toString()});
    for (item=0; item<other_count; item++){
        stmt.run(Object.values(slud[item]));
    }
})