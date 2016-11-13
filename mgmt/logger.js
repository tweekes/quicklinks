module.exports = (config) => {
    var device = dummyDevice;
    if (config.region === "DEV") {
        device = console;
    }

    return {
            info: (msg) => {
                device.log("INFO " + msg);
            },
            debug: (msg) => {
                device.log("DEBUG " + msg);
            }
    }
};

var dummyDevice = {
    log : (msg) => {
        // do nothing
    }
}