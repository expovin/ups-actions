const SynoDB = require("./SynoDB");

Sdb = new SynoDB();

Sdb.init()
.then(()=> Sdb.snapShot("Outage"))
.then(()=> Sdb.close())
.catch(error => console.log(error))
