const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation-right-panel', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-right-panel', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 900, height: 900 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-right-panel.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it.skip('renders the right panel', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('rubric-read-only', async function() {
		const rect = await visualDiff.getRect(page, '#rubric-read-only');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('rich-text-editor-disabled', async function() {
		const rect = await visualDiff.getRect(page, '#rich-text-editor-disabled');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('hiding-rubric', async function() {
		const rect = await visualDiff.getRect(page, '#hiding-rubric');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('hiding-grade', async function() {
		const rect = await visualDiff.getRect(page, '#hiding-grade');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('hiding-feedback', async function() {
		const rect = await visualDiff.getRect(page, '#hiding-feedback');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('hiding-outcomes', async function() {
		const rect = await visualDiff.getRect(page, '#hiding-outcomes');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it.skip('hiding-all', async function() {
		const rect = await visualDiff.getRect(page, '#hiding-all');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});
