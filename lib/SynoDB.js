const mariadb = require('mariadb');
const { dbCred } = require("../bin/settings");

class REPO {

    constructor() {
        this.conn;
    }

    init(){
        console.log(dbCred);
        const pool = mariadb.createPool(dbCred);
        return new Promise((fulfill, reject) => {
            pool.getConnection()
            .then ( conn => {
                this.conn=conn;
                fulfill("OK");
            })
            .catch( error => reject("Error connecting to MariaDb :"+error))   
        })
    }

    snapShot(note){
        return new Promise( (fulfill, reject) => {
            let sql = " insert into `_RecordTotale` (Potenza, Descrizione, AvgMin2, AvgMin92, AvgMin182, Note) \
                        select Potenza, Descrizione, AvgMin2, AvgMin92, AvgMin182, '"+note+"' from `_RecordTotale` rt where id=1"
            this.conn.query(sql)
                .then( result => fulfill(result))
                .catch( error => reject(error))                          
        })            
    }    
    
    close(){
        this.conn.end();
    }

}

module.exports = REPO;