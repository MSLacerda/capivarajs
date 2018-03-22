module.exports = {
    "Hello": function (browser) {
        browser.resizeWindow(1920, 1080);
        browser
            .url('http://localhost:1111/test/e2e/cpElseIf/template.html')
            .waitForElementVisible('button', 10000)
            .pause(1000)
            .getText('button', function (result) {
                if (result.value == 'Clique para Somar') {
                    browser.click('button')
                        .pause(1000)
                        .getText('button', function (result2) {
                            if (result2.value == 'Clique para Somar')
                                browser.click('button')
                                    .pause(1000)
                                    .getText('h1', function (result3) {
                                        if (result3.value == 'H1 com ELSE tem a soma igual a 3.') {
                                            browser.pause(1000)
                                            console.log('Passou no teste')
                                        } else {
                                            browser.pause(1000)
                                            console.log('Falhou!!!')
                                            browser.waitForElementVisible('div', 10)
                                        }
                                    })
                        })
                }
            })
        browser.end()
    }
}