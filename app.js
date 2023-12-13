const express = require('express');
const helper = require('./helper.js');
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json());

static = __dirname+'/static/'

function create_html_resp(resp){

    var final_html = "";
    final_html += fs.readFileSync(static+'header.html', 'utf-8');
    final_html += '<div class="container" id="rezultati"><h1 class="text-center">Rezultāti</h1>'

    for (var i=0; i<resp.length;i++){

        var to_add = ""
        var main_image = `<a href=${resp[i].listing} target="_blank"><img class="border border-3 mx-auto d-block" src=${resp[i].main_image}></a>`;
        var price = `<p class="h5 fw-bold">Cena: ${resp[i].price}€</p>`;
        var address = `<p class="h6 text-secondary">${resp[i].address.join(', ')}</p>`;
        var size = `<p>Zemes platība: ${resp[i].lot_size}m² ${"&nbsp;".repeat(5)} Mājas platība: ${resp[i].property_size}m²</p>`;
        
        to_add += `<div class="col">\n\t${main_image}\n${price}${address}\n${size}</div>`;

        if (i%2===1) {
            to_add += "</div>";
        } else {
            to_add = '<div class="row align-middle p-3">'+to_add;
        }

        final_html += to_add;
    }

    final_html += fs.readFileSync(static+'footer.html', 'utf-8');
    return final_html;
}

app.get('/', (req, res) => {
    res.sendFile(static + 'index.html');
});

app.get('/search', async (req, res) => {
    var req_data = {};

    for (var [key, value] of Object.entries(req.query)){

        if (typeof value == 'object'){
            req_data[key+"["+Object.keys(value)+"]"] = Object.values(value)[0]
        } else if (parseInt(value) > 0) {
            req_data[key] = value
        }
    }

    var resp = await helper.search(req_data);

    if (typeof resp === "string") {
        res.send(fs.readFileSync(static+'header.html', 'utf-8')+"<div class='text-center'><h1>Neko neatradām ar šiem kritērijiem :(</h1></div></body></html>");
    } else {
        res.send(create_html_resp(resp));
    }
});

app.listen(port, () => console.log(`App started on port ${port}`));