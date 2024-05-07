## How to run:
* In the folder with the file "package.json" run `npm install`
* Then `node app.js`

# Projekts ir pabeigts

## Funkcijas analīze:
```js
function process_data(data){
    //only take the useful data from response
    for (var i=0; i<data.length; i++){

        var return_data = {};
        useful_data.forEach((param) => {(data[i][param]!= null) ? return_data[param]=data[i][param] : return_data[param]="???"});

        //extract url from main_image value and replace placeholder {fmt:em} with the resolution
        //catch ir tad, ja nav bildes
        try{
            return_data["main_image"] = return_data["main_image"]["url"].replace("{fmt:em}", "13");
        }
        catch{ 
            return_data["main_image"] = "https://www.city24.lv/assets/img/placeholder/object_placeholder.46f176b8.svg"
        }
        return_data["listing"] = "https://www.city24.lv/real-estate/houses-for-sale/a/" + data[i]["friendly_id"]; //tas a ir vienkarsi vajadzigs


        address = [];
        address_data.forEach((param) => { if(data[i]["address"][param]!= null) address.push(data[i]["address"][param])});

        return_data["address"] = address.join(", ");

        data[i] = return_data;
    }
    return data
}
```
Šīs funkcijas darbības laiks ir lineāri atkarīgs no tā, cik es sludinājumus meklēju vienā reizē -> cik dažādi objekti tiks atgriezti un ielikti funkcijā. Tehniski labākais risinājums būtu jau uzreiz dabūt tikai vērtīgos laukus meklējot city24.lv, bet tā kā tas nav iespējams, tad ir nepieciešama šī funkcija. Īsti neko uzlabojamu šeit neredzu, jo šeit netiek veiktas nekādas sarežģītas darbības, vienkārši izvilktas vērtības no laukiem. Ja gribētu kaut kādu uzlabojumu veikt, tad varētu paskatīties un uzzināt, ka visiem sludinājumiem ir vienāda struktūra -> vienas un tās pašas vērtības vienmēr ir noteiktas pozīcijās -> dabūt vērtības pēc to indeksiem, bet tad kods būtu grūti lasāms un nekādu reālu milzīgu uzlabojumu tas nedotu. Vēļ mazs uzlabojums varētu adresei nevis veidot listu, bet jau uzreiz "joinot" elementus kopā vienā stringā. Secinu, ka šim kodam nav veicams nekāds milzīgs uzlabojums.
