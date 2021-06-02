import '../consistent-evaluation.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('d2l-consistent-evaluation', () => {

	it('should pass all axe tests', async() => {
		const el = await fixture(html`<d2l-consistent-evaluation></d2l-consistent-evaluation>`);
		expect(el).to.be.accessible();
	});

});
