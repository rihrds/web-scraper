How to run:
* In the folder with the file "package.json" run `npm install`
* Then `node app.js`

Uz nakamo reizi būs:
* Darbības principa izmaiņas: Vairs netiks veikts web request uz city24.lv, kad tiks veikta meklēšana. Tā vietā būs sqlite datubāze, kurā jau iepriekš tiks saglabāti sludinājumi. Tas ļaus ātrāku servera darbu.
* Ar datubāzes izveidi, tagad varēs ar iekļaut ss.lv, jo ss.lv atļauj tikai meklēt mājas pēc novada/reģiona, bet ar datubāzi, visi sludinājumi jau būs saglabāti un varēs meklēt jau pēc citiem parametriem arī.
* Iespējams jau būs izveidots plānveidīga sludinājumu pārbaude - pārbauda vai nav jauni sludinājumi nākuši klāt un izdzēsti vecie. (Pieraksts sev: Apskatās jaunākos, piefiksē reģionu, meklē reģionu - (jauno skaits) un paskatās vai nav mazāk par to, cik ir db, ja mazāk tad atrod veco un izdzēš)

Pagaidām ir:
* Plāns datubāzes izveidei un procesa organizēšanai
* Mobilais skats
