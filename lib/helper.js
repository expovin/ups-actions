const settings = require("../bin/settings");
const { exec } = require('child_process');
const fetch = require('node-fetch');
const toJSON = require('utils-error-to-json');
const Synology = require("synology-diskstation");


const synology = new Synology(settings.syno.host, settings.syno.port);

module.exports = {


    checkSynoOn : function(){
        return new Promise( (fulfill, reject) =>{
            synology.isOn(function(err, isOn) {
                if(err)
                    reject(err);
                else
                    fulfill(isOn)
              })            
        })
    },

    turnSynoOn : function (){
        return new Promise((fulfill, reject) =>{
            synology.wol(settings.syno.MAC, (err) => {
                if(err)
                    reject(err);
                else
                    fulfill("Synology turned ON")
              })    
        })
    
    },

    turnSynoOff : function (){
        return new Promise((fulfill, reject) =>{
            synology.login(settings.syno.user, settings.syno.passwd, (err, sid) => {
                if (err) 
                    reject(err)
                else {
                    synology.shutdown(sid, (err) => {
                        if (err) 
                            reject(err)
                        else
                            fulfill("Synology turned OFF");
                      })
                }

              })   
        })
    },    

    execCommand : function (cmd){
        return new Promise( (fulfill, reject) =>{
            exec(cmd, (err, stdout, stderr) =>{
                if(err) reject({err:toJSON(err), stderr:stderr});
                    //console.log(stdout.split("\n"));
                    fulfill(stdout)
            })   
        })  

    },

    chkUPSStatus : function() {
        let result={};
        return new Promise( (fulfill, reject) =>{
            console.log("Checking UPS Status")
            this.execCommand(settings.command.getUPSStatus)
            .then(stdout =>{
                stdout.split("\n").forEach(ele => {
                    let key=ele.split(':')[0];
                    let key1=key.split(".")[0];
                    let key2=key.split(".")[1];
                    let val=ele.split(':')[1];
                    if(key1){
                        if(!result[key1.trim()])
                            result[key1.trim()]={};
    
                        result[key1.trim()][key2.trim()]=val.trim();
                    }
                })
                fulfill({success:true ,data:result, status:(result.ups.status === 'OL')})
            })
        })    
    },

    sendEmail : function(data, host, port, flagEmail) {
        if(flagEmail) {
            return new Promise((fulfill, reject) =>{
                fetch("http://"+host+":"+port+"/service/email", {
                    "headers": {
                        'Content-Type': 'application/json'
                    },            
                    "referrerPolicy": "no-referrer-when-downgrade",
                    "body": JSON.stringify(data),
                    "method": "POST",
                    "mode": "cors"
                  })
                  .then(res => res.text())
                  .then(body => {
                        fulfill(body)
                  })    
                  .catch(err => reject(toJSON(err)))         
            }) 
        }
    },

    stopSyno : function(logger) {
        // First Check if outage is over
        let upsStatus={};
        return new Promise((fulfill, reject) =>{
            this.chkUPSStatus()
            .then(result =>{
                logger.debug("UPD Status : "+result.status)
                if(result.status){
                    logger.info("Interruzione corrente terminata.... uscita processo")
                    fulfill(result)
                } else {
                    upsStatus=result;
                    logger.info("Stopping Synology ... ");
                    let date_ob = new Date();
                    let dt = date_ob.getFullYear()+
                        ("0" + (date_ob.getMonth() + 1)).slice(-2)+
                        ("0" + date_ob.getDate()).slice(-2)+
                        date_ob.getHours()+
                        date_ob.getMinutes()+
                        date_ob.getSeconds()
                    result["dt"]=dt;                    
                    
                    return (this.turnSynoOff())                    
                }
            })
            .then( result => fulfill({stopCmd:result, upsStatus:upsStatus})) 
        })
    },

    stopNanoGate : function(logger) {
        // First Check if outage is over
        let upsStatus={};
        return new Promise((fulfill,reject) => {
            this.chkUPSStatus()
            .then(result =>{
                logger.debug("UPD Status : "+result.status)
                if(result.status){
                    logger.info("Interruzione corrente terminata.... uscita processo")
                    fulfill(result)
                } else {
                    upsStatus=result;
                    logger.info("Stopping NanoGate ... ");
                    let date_ob = new Date();
                    let dt = date_ob.getFullYear()+
                        ("0" + (date_ob.getMonth() + 1)).slice(-2)+
                        ("0" + date_ob.getDate()).slice(-2)+
                        date_ob.getHours()+
                        date_ob.getMinutes()+
                        date_ob.getSeconds()
                    result["dt"]=dt;
        
                    return( this.execCommand(settings.command.stopNanoGate) )
                }
            })
            .then( result => fulfill({stopCmd:result, upsStatus:upsStatus})) 
        })

    },

    spegniCiabatta : function(logger) {
        logger.info("Spegnimento ciabatta");
        return new Promise( (fulfill, reject) =>{
            this.execCommand(settings.command.stopCiabatta)
            .then( result => fulfill(result)) 
        })
    },

    accendiCiabatta : function(logger) {
        logger.info("Accensione ciabatta");
        return new Promise( (fulfill, reject) =>{
            this.execCommand(settings.command.startCiabatta)
            .then( result => fulfill(result)) 
        })
    }    

}