#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('fs');
const settings = require('./settings');
const hlp = require('../lib/helper');
const db = require("../lib/db");


hlp.sendWebHookToHomeAssistant("ONLINE","script.ups_check_online");

const DB = new db();


let flagEmail=true;
let date_ob = new Date();
let dt = date_ob.getFullYear()+
            ("0" + (date_ob.getMonth() + 1)).slice(-2)+
            ("0" + date_ob.getDate()).slice(-2)+
            date_ob.getHours()+
            date_ob.getMinutes()+
            date_ob.getSeconds()

const options = yargs
 .usage("Usage: [OPTIONS]")
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

// Log ONLINE
let emailData = {
    emailFrom : settings.email.sender,
    emailTo : settings.email.to,
    emailSubject : "Interruzione corrente termiata.",
    emailBody :"Triggered ONLINE NOTIFYFLAG at "+dt+" wait "+settings.timeToStopSyno+" sec. before stopping Synology"

}
logger.warn(emailData.emailBody);
hlp.sendEmail(emailData, settings.email.host, settings.email.port, flagEmail)
.then( result => logger.info(result))
.catch( error => logger.error(error))

DB.addEvent({step:"Outage is Over, Get Online Event"})


hlp.accendiCiabatta(logger)           // 1) Attivare Ciabatta 
.then(hlp.turnSynoOn)           // 2) Inviare Magic Packet a Synology (3 1 al secondo)
.then(DB.outageOver)
// Controlare battery.charge > soglia
// Inviare aggiornamento nuovo indirizzo a godaddy e via email

// 2) Inviare Magic Packet a NanoGate (3 1 al secondo)

// Per ogni azione tracciare eventi ne DB

