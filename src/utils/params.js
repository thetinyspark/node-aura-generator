const fs = require("fs");

function getArg(p_name, p_mandatory = false) {
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] == p_name) {
            if (i + 1 < process.argv.length) {
                return process.argv[i + 1];
            }
        }
    }

    if (p_mandatory) {
        console.log(p_name, " parameter is mandatory");
        process.exit();
    }

    return null;
}

function getConfig(p_name, p_mandatory = false) {
    let arg = getArg(p_name, p_mandatory);
    let file = fs.readFileSync(arg);
    return JSON.parse(file);
}

module.exports = {

    getArg: getArg,

    getConfig: getConfig
};