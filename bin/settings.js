module.exports = {

    email :   {
        host: "192.168.0.18",
        port: 3200,
        to:"expovin@gmail.com",
        sender: "UPS Manager <expovin@me.com>",
        defoultObject : "Power Outage"
    },

    dbCred : {
        host:"192.168.0.4",
        port: 3307,
        database : "apiService",
        user : "root",
        password : "top$ecret",
        connectionLimit: 5
    },       

    data : {
        outages:"/home/pi/api/ups-actions/data/outages.db",
        stato:"/home/pi/api/ups-actions/data/.stato"
    },

    /**
     * Opzioni per il logging
     */
    log : {
        /** Livello log usato se non diversamente specificato via command line
         * valori possibili [fatal | error | warn | info | debug]
         */
        level : "info",  
        /** Path di default dove vengono scritti i file di log quano specificati
         * da linea di comando
         */
        path:""
    },

    /** Percentuale dopo la quale vengono attivati 
     * gli appliance.
     */
    battRestart : {
        ciabatta: 15,
        Syno:50,
    },

    syno :{
        user:'SynoApi',
        passwd:'eiW7Xp%Hht%NkE7e',
        host:"192.168.0.4",
        port:8080,
        MAC:"00-11-32-D2-B7-B8"
    },

    HomeAssistant : {
        url : "http://192.168.0.151:8123/",
        webhookUri: "api/webhook/",
        code : "103-controllo-stato-ups-rack-lavanderia-xxLfvZpXIJj7FjfXt74yBoaZ"
    },

    command:{
        stopCiabatta:"/home/pi/domotica/CiabattaRack/switchOff.sh",
        startCiabatta:"/home/pi/domotica/CiabattaRack/switchOn.sh",
        stopNanoGate:"ssh -t nanoGate 'sudo shutdown -h now'",
        startNanoGate:"etherwake -i eth0 DA:6F:9A:B2:17:79",
        stopSyno:"echo .",
        startSyno:"etherwake -i eth0 00-11-32-D2-B7-B8",
        getUPSStatus:"upsc tecnoware"
    },
    
    /** Tepo dopo il quale vengono spenti gli appliance   */
    timeToStopSyno : 5 * 60 * 1000,    // 5 minuti,
    timeToStopPower: 10 * 60 * 1000,    // 10 minuti 
    timeToStopNano : 11 * 60 * 1000,    // 11 minuti 
    timePollingCheck: 3 * 60 * 1000    // 3 minuti
}