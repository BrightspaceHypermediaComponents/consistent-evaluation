const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation-evidence-text', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-evidence-text', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 1000, height: 2000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-evidence-text.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('renders evidence text', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});
