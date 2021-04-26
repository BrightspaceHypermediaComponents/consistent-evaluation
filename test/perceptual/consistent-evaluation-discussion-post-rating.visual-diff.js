const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation-discussion-post-rating', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-discussion-post-rating', __dirname);
	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 900, height: 900 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-discussion-post-rating.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('renders the discussion five star rating', async function() {
		const rect = await visualDiff.getRect(page, '#fivestar-rating');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders the discussion upvote downvote rating', async function() {
		const rect = await visualDiff.getRect(page, '#upvotedownvote-rating');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders the discussion upvote only rating', async function() {
		const rect = await visualDiff.getRect(page, '#upvoteonly-rating');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});
});
