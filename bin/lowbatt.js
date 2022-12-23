#!/usr/bin/env node
const hlp = require('../lib/helper');

hlp.sendWebHookToHomeAssistant("LOWBATT","script.ups_check_lowbatt");
console.log("Questo lowbatt!");
