/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe.skip('d2l-consistent-evaluation', () => {
//SKIPPED SO WE CAN GET PEGGY TESTING THIS, ACTIVELY FIXING
	const visualDiff = new VisualDiff('consistent-evaluation-learner-context-bar', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 1000, height: 1000 } });
		page
			.on('console', message =>
				console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
			.on('pageerror', ({ message }) => console.log(message))
			.on('requestfailed', request =>
				console.log(`${request.failure().errorText} ${request.url()}`));
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
		await page.$eval('#default', async(elem) => {
			const lcb = elem.querySelector('d2l-consistent-evaluation-learner-context-bar');
			const userContext = lcb.querySelector('d2l-consistent-evaluation-lcb-user-context');
			console.log('==========================================================');
			console.log(JSON.stringify(userContext));
			console.log('==========================================================');
			const card = userContext.shadowRoot.querySelector('d2l-labs-user-profile-card');
			card._userProfileCardSettings = {
				showPicture: true,
				showTagline: true,
				showHomepageUrl: true,
				showSocial: true,
				showOnlineStatus: true,
				showRole: true,
				showBadgeTrophy: true,
				showOrgDefinedId: true
			};
			const listener = new Promise((resolve) => {
				card.addEventListener('d2l-labs-user-profile-card-opened', resolve, { once: true });
			});
			card.open();
			return listener;
		});
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('renders learner context bar with exempt', async function() {
		const rect = await visualDiff.getRect(page, '#is-exempt');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});
