#!/usr/bin/env node
const hlp = require('../lib/helper');
hlp.sendWebHookToHomeAssistant("ONBATT","script.ups_check_onbatt");