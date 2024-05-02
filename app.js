import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const helper_location = path.resolve(__dirname, './helper.js');
var helper = await import("file://"+helper_location);

const database_location = path.resolve(__dirname, './database/database.js');
var database = await import("file://"+database_location);

database = database["default"];
helper = helper["default"];

var order_conversion = [{"pasc":"price ASC"}, {"pdesc":"price DESC"}, {"lsasc":"lot_size ASC"}, {"lsdesc":"lot_size DESC"}, {"psasc":"prop_size ASC"}, {"pdesc":"prop_size DESC"}]
var order_conversion_keys = ["pasc", "pdesc", "lsasc", "lsdesc", "psasc", "psdesc"]

import fs from 'node:fs';

const app = express();
const port = 3000;

app.use(express.json());

function create_html_resp(resp){

    var final_html = "";
    final_html += fs.readFileSync(__dirname+'/static/header.html', 'utf-8');
    final_html += '<div class="container" id="rezultati"><h1 class="text-center">Rezultāti</h1>'

    for (var i=0; i<resp.length;i++){

        var to_add = ""
        var main_image = `<a href=${resp[i].url} target="_blank"><img class="border border-3 mx-auto d-block" max-width="500px" height="350px" src=${resp[i].image}></a>`;
        var price = `<p class="h5 fw-bold">Cena: ${resp[i].price}€</p>`;
        var address = `<p class="h6 text-secondary">${[resp[i].region, resp[i].address].join(", ")}</p>`;
        var size = `<p>Zemes platība: ${resp[i].lot_size}${resp[i].lot_size_unit} ${"&nbsp;".repeat(5)} Mājas platība: ${resp[i].prop_size}m²</p>`;
        
        to_add += `<div class="col">\n\t${main_image}\n${price}${address}\n${size}</div>`;

        if (i%2===1) {
            to_add += "</div>";
        } else {
            to_add = '<div class="row align-middle p-3">'+to_add;
        }

        final_html += to_add;
    }

    final_html += fs.readFileSync(__dirname+'/static/footer.html', 'utf-8');
    return final_html;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname +'/static/index.html');
});

app.get('/search', async (req, res) => {
    var req_data = req.query;
    console.log(req_data)
    var page = req_data["page"];
    delete req_data["page"]
    req_data["$page"] = page;
    var order = req_data["order"];
    delete req_data["order"];
    req_data["$order"] = Object.values(order_conversion[order_conversion_keys.indexOf(order)]);
    console.log(req_data);

    /*for (var [key, value] of Object.entries(req.query)){

        if (typeof value == 'object'){
            for (var [k, v] of Object.entries(value))
                req_data[key+"["+k+"]"] = v
        } else if (parseInt(value) > 0) {
            req_data[key] = value
        }
    }*/

    var resp = await database.retrieve_data(req_data);
    console.log(resp)

    if (typeof resp === "string") {
        res.send(fs.readFileSync(__dirname+'/static/header.html', 'utf-8')+"<div class='text-center'><h1>Neko neatradām ar šiem kritērijiem :(</h1></div></body></html>");
    } else {
        res.send(create_html_resp(resp));
    }
});

app.listen(port, () => console.log(`App started on port ${port}`));