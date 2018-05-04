module.exports = {
	'cpDoubleClick': function (browser) {
		browser
			.resizeWindow(1920, 1080)
			.url('http://localhost:1111/test/e2e/cpDoubleClick/template.html')
			.waitForElementVisible('button', 10000)
			.pause(1000)
			.assert.containsText('button', 'Double Click me')
			.click('button')
			.click('button')
			.pause(1000)
			.assert.containsText('button', 'Double Clicked')
			.pause(1000)
			.end();
	}
};
