const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation-discussion-evidence-body', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-discussion-evidence-body', __dirname);
	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 900, height: 900 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-discussion-evidence-body.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('renders a discussion evidence body', async function() {
		const rect = await visualDiff.getRect(page, '#discussion-post');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders a discussion reply evidence body', async function() {
		const rect = await visualDiff.getRect(page, '#reply');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders a discussion evidence body with attachments', async function() {
		const rect = await visualDiff.getRect(page, '#discussion-post-with-attachments');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});
});
