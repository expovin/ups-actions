
const hlp = require('../lib/helper');

//hlp.sendWebHookToHomeAssistant("ONBATT","script.ups_check_onbatt");
hlp.chkUPSStatus()
.then(result => console.log(result))