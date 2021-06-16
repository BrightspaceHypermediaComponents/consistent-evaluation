const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation', () => {
	const visualDiff = new VisualDiff('consistent-evaluation-learner-context-bar', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 1000, height: 1000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-lcb.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('renders learner context bar with skeleton', async function() {
		const rect = await visualDiff.getRect(page, '#skeleton');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders learner context bar', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders learner profile card', async function() {
		await page.$eval('#open-card', async(elem) => {
			const lcb = elem.querySelector('d2l-consistent-evaluation-learner-context-bar');
			const userContext = lcb.shadowRoot.querySelector('d2l-consistent-evaluation-lcb-user-context');
			const card = userContext.shadowRoot.querySelector('d2l-labs-user-profile-card');
			const listener = new Promise((resolve) => {
				card.addEventListener('d2l-labs-user-profile-card-opened', resolve, { once: true });
			});
			card.open();
			return listener;
		});
		const rect = await visualDiff.getRect(page, '#open-card-wrapper');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders learner context bar with exempt', async function() {
		const rect = await visualDiff.getRect(page, '#is-exempt');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});
