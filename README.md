## How to run:
* In the folder with the file "package.json" run `npm install`
* Then `node app.js`

## Uz nākamo reizi būs:
* Darbības principa izmaiņas: Vairs netiks veikts web request uz city24.lv, kad tiks veikta meklēšana. Tā vietā būs sqlite datubāze, kurā jau iepriekš tiks saglabāti sludinājumi. Tas ļaus ātrāku servera darbu.
* Ar datubāzes izveidi, tagad varēs ar iekļaut ss.lv, jo ss.lv atļauj tikai meklēt mājas pēc novada/reģiona, bet ar datubāzi, visi sludinājumi jau būs saglabāti un varēs meklēt jau pēc citiem parametriem arī.
* Tagad, kad būs datubāze varēs arī veikt rezultātu kārtošanu, piemēram, jaunākie vispirms, kā arī citos veidos.
* Iespējams jau būs izveidots plānveidīga sludinājumu pārbaude - pārbauda vai nav jauni sludinājumi nākuši klāt un izdzēsti vecie. (Pieraksts sev: Apskatās jaunākos, piefiksē reģionu, meklē reģionu - (jauno skaits) un paskatās vai nav mazāk par to, cik ir db, ja mazāk tad atrod veco un izdzēš)

## Pagaidām ir:
* Iesākts darbs pie datubāzes veidošanas.
* Mobilais skats

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

## Darba plāns
* Uztaisīt funkciju failā helper.js, kas kā ar city24.lv, var sameklēt visus sludinājumus. Vēl jānoskaidro, kā tas ir izdarāms skatoties networks tab veicot dažādus requestus uz ss.lv
* Uztaisīt database.js failā tā, lai jauna datubāze tiek izveidota tikai tad, ja tā jau neeksistē. Šo var izdarīt pārbaudot vai pats fails neeksistē vai kādā citā veidā, vēl nezinu tieši kā. To noskaidroju procesā, kā ir labāk.
* Pārveidot helper.js failu tā, lai tas, meklējot manā lapā sludinājumus, vairs neveic web requestus 
