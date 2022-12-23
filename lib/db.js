var Datastore = require('nedb');
const settings = require("../bin/settings");
var outages = new Datastore({ filename: settings.data.outages });
var fs = require('fs');


class REPO {

    newOutage() {       
        return new Promise( (fulfill, reject)=>{
            let date_ob = new Date();
            let dt = date_ob.getFullYear()+
                ("0" + (date_ob.getMonth() + 1)).slice(-2)+
                ("0" + date_ob.getDate()).slice(-2)+
                date_ob.getHours()+
                date_ob.getMinutes()+
                date_ob.getSeconds();

            let doc={
                startAt:dt,
                stato:"OPEN",
                actions:[{time:dt, event:"Outage"}]
            }

            outages.loadDatabase(function(err) {
                outages.insert(doc, (err, doc) => {
                    if(err)
                        reject(err);

                    fs.writeFileSync(settings.data.stato,"currentStatus="+doc._id,'utf8')
                    fulfill(doc);
                });  
            })
        })
    }

    addEvent(event) {
        return new Promise( (fulfill, reject) =>{
            let stream=fs.readFileSync(settings.data.stato,'utf-8');
            let _id=stream.split('=')[1]
            console.log("_id : "+_id);

            let date_ob = new Date();
            let dt = date_ob.getFullYear()+
                ("0" + (date_ob.getMonth() + 1)).slice(-2)+
                ("0" + date_ob.getDate()).slice(-2)+
                date_ob.getHours()+
                date_ob.getMinutes()+
                date_ob.getSeconds();

            outages.loadDatabase(function(err) {
                outages.update({_id:_id}, {
                    $push : {actions : {dt:dt,event:event}}
                },(err,doc) =>{
                    if(err)
                        reject(err);
                    fulfill(doc);
                })
            })

        })
    }
          
  

    outageOver() {
        return new Promise( (fulfill, reject) =>{
            let stream=fs.readFileSync(settings.data.stato,'utf-8');
            let _id=stream.split('=')[1]
            console.log("_id : "+_id);

            let date_ob = new Date();
            let dt = date_ob.getFullYear()+
                ("0" + (date_ob.getMonth() + 1)).slice(-2)+
                ("0" + date_ob.getDate()).slice(-2)+
                date_ob.getHours()+
                date_ob.getMinutes()+
                date_ob.getSeconds();

            outages.loadDatabase(function(err) {
                outages.update({stato:"OPEN"}, {
                    $set : {stato:"CLOSE",closedAt:dt}
                }, (err,doc) =>{
                    if(err)
                        reject(err);

                    fs.writeFileSync(settings.data.stato,"currentStatus=ONLINE",'utf8')
                    fulfill(doc);
                })
            })

        })        
    }

    getOPEN() {
        return new Promise( (fulfill, reject) =>{
            outages.loadDatabase(function(err) {
                outages.find({stato:"OPEN"}, (err,doc) =>{
                    if(err)
                        reject(err);
                    fulfill(doc);
                })
            })

        })          
    }

    getALL() {
        return new Promise( (fulfill, reject) =>{
            outages.loadDatabase(function(err) {
                outages.find({}, (err,doc) =>{
                    if(err)
                        reject(err);
                    fulfill(doc);
                })
            })

        })          
    }    

}

module.exports = REPO;