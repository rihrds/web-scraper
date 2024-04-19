import db from './database/database.js'

(async () => {
    await db.retrieve_data({"$min_price": 0, "$max_price":2800000,"$max_prop_size":10000000000});
})();