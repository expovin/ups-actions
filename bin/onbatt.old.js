#!/usr/bin/env node
const SynoDB = require("./SynoDB");
const yargs = require('yargs');
const fs = require('fs');
const settings = require('./settings');
const hlp = require('../lib/helper');
const db = require("../lib/db");



hlp.sendWebHookToHomeAssistant("ONBATT","script.ups_check_onbatt");

const DB = new db();
Sdb = new SynoDB();

let flagEmail=true;
let date_ob = new Date();
let dt = date_ob.getFullYear()+
            ("0" + (date_ob.getMonth() + 1)).slice(-2)+
            ("0" + date_ob.getDate()).slice(-2)+2
            date_ob.getHours()+
            date_ob.getMinutes()+
            date_ob.getSeconds()

const options = yargs
 .usage("Usage: [OPTIONS]")
 .option("s", { alias: "syno", describe: "Time to stop Synology", type: "string", demandOption: false })
 .option("a", { alias: "all", describe: "Time to stop all", type: "string", demandOption: false })
 .option("t", { alias: "email", describe: "Send email (default true)", type: "string", demandOption: false })
 .option("f", { alias: "logfile", describe: "Write logs to file", type: "string", demandOption: false })
 .option("l", { alias: "level", describe: "fatal | error | warn | info | debug", type: "string", demandOption: false })
 .argv;

 if(options.email === "false")
    flagEmail=false;

if(options.logfile) 
    logger = require('logger').createLogger(options.logfile);
else
    logger = require('logger').createLogger();

// Set the right log level if specified
if(options.level) {
    let levels=['fatal','error','warn','info','debug'];
    if(levels.indexOf(options.level) == -1) {
        logger.fatal("log level not recognized. Available level are: "+JSON.stringify(levels))
    }
    logger.setLevel(options.level);
} else logger.setLevel(settings.log.level)   


// Log ON BATT
let emailData = {
    emailFrom : settings.email.sender,
    emailTo : settings.email.to,
    emailSubject : "Interruzione corrente",
    emailBody :"Triggered ONBATT NOTIFYFLAG at "+dt+" wait "+settings.timeToStopSyno+" sec. before stopping Synology"

}
logger.warn(emailData.emailBody);

Sdb.init()
.then(()=> Sdb.snapShot("Outage"))
.then(()=> Sdb.close())
.catch(error => console.log(error))

DB.newOutage()
.then(() => hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail))
.then( result => {    
    logger.info(result)
    DB.addEvent({step:"Warning message sent", data:JSON.parse(result)})
})
.catch( error => {
    DB.addEvent({step:"Warning message sent with errors", error:error})
    logger.error(error)
})


// Waiting to stop Synology
setTimeout(() => {hlp.stopSyno(logger)
    .then( result => {
        logger.info(result);
        if(result.status)
            process.exit(100);

        emailData = {
            emailFrom : settings.email.sender,
            emailTo : settings.email.to,
            emailSubject : "Stop Synology",
            emailBody :"Comando di Stop Synology correttamente inviato alle "+result.dt
        };
        DB.addEvent({step:"Synology Stopped", data:result})
        return (hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail))
    })
    .then( result => {
        logger.info(result)
        DB.addEvent({step:"Warning message sent", data:JSON.parse(result)})
    })    
    .catch( error => {
        logger.error(error);
        emailData = {
            emailFrom : settings.email.sender,
            emailTo : settings.email.to,
            emailSubject : "Stop Synology ERROR",
            emailBody :"Errore invio comando di Stop Synology alle "+dt+" result "+JSON.stringify(error)
        };
        hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail);
        DB.addEvent({step:"Warning message sent with errors", error:error})
    })}
    , settings.timeToStopSyno)


// Waiting to stop NanoGate
setTimeout(() => {hlp.stopNanoGate(logger)
    .then( result => {
        logger.info(result);
        if(result.status)
            process.exit(100);
                    
        emailData = {
            emailFrom : settings.email.sender,
            emailTo : settings.email.to,
            emailSubject : "Stop NanoGate",
            emailBody :"Comando di Stop Nanogate correttamente inviato alle "+result.dt
        };
        DB.addEvent({step:"Nano Gate Stopped", data:result})
        return (hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail))
    })  
    .catch( error => {
        logger.error(JSON.stringify(error));
        emailData = {
            emailFrom : settings.email.sender,
            emailTo : settings.email.to,
            emailSubject : "Stop Nano Gate ERROR",
            emailBody :"Errore invio comando di Stop Nano Gate result "+JSON.stringify(error)
        };
        hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail);
        DB.addEvent({step:"Warning message sent with errors", error:error})
    }) }
    , settings.timeToStopNano)
    
    


// Waiting to stop Power Strip
setTimeout(() => {hlp.spegniCiabatta(logger)
    .then( result => {
        logger.info(result);
        if(result.status)
            process.exit(100);
                    
        DB.addEvent({step:"Stop corrente Ciabatta", data:JSON.parse(result)})
    }) 
    .catch( error => {
        logger.error(JSON.stringify(error));
        DB.addEvent({step:"Errore spegnimento Ciabatta Ciabatta", error:error})
    }) }
    , settings.timeToStopPower)


// Waiting for start Loop sending UPS Status
setTimeout( () => {

    let interval = setInterval( () => {
        hlp.chkUPSStatus()
        .then(result => {
            if(result.status){
                // Interruzione ciclo e uscita
                clearInterval(interval)

            } else
                DB.addEvent({step:"Battery Monitor", data:result})
        })

    }, settings.timePollingCheck)
    
},  settings.timeToStopSyno + 
    settings.timeToStopPower + 
    settings.timeToStopNano + 
    settings.timePollingCheck)