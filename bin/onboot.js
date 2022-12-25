#!/usr/bin/env node
const hlp = require('../lib/helper');
hlp.sendWebHookToHomeAssistant("ONBOOT","script.ups_check_onboot");

