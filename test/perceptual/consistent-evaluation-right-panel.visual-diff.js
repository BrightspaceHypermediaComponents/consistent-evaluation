const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-consistent-evaluation-right-panel', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-right-panel', __dirname);

	let browser, page;

	const tests = [
		'renders-right-panel',
		'rubric-read-only',
		'hiding-rubric',
		'hiding-grade',
		'hiding-feedback',
		'hiding-outcomes',
		'hiding-coa-override',
		'hiding-all'
	];

	const categories = [
		{ name: 'desktop', width: 900 },
		{ name: 'mobile', width: 700 }
	];

	async function setupForSize(width) {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width, height: 6000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-right-panel.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	}

	categories.forEach((cat) => {
		describe(cat.name, () => {

			before(async() => await setupForSize(cat.width));
			after(async() => await browser.close());

			tests.forEach((testName) => {
				it(`${testName}`, async function() {
					const rect = await visualDiff.getRect(page, `#${testName}`);
					await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
				});
			});
		});
	});

});
