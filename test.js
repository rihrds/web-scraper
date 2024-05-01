import db from './database/database.js'

(async () => {
    var regions = await db.retrieve_data({"$min_price":0});
    var regs = []
    regions.forEach(element => {
        regs.push(Object.values(element)[0])
    });
    regs = [...new Set(regs)]
    console.log(regs.length)
    //2 par daudz
})();