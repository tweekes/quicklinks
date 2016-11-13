exports.config = {
    framework: 'jasmine2',
    chromeOnly: true,
    chromeDriver: 'C:\\Users\\Tommy\\AppData\\Roaming\\npm\\node_modules\\protractor\\selenium\\chromedriver',
    capabilities: {
        'browserName': 'chrome'
    },
    onPrepare: function () {
        browser.driver.manage().window().setSize(1680, 900);
    },
    specs: ['spec-vert-section.js']
}