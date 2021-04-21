import { formatDateTime, getLinkIconTypeFromUrl } from '../../components/helpers/submissionsAndFilesHelpers.js';
import { assert } from '@open-wc/testing';

describe('submissionsAndFilesHelpers tests', () => {

	describe('formatDateTime tests', () => {
		const dateStr = '2021-03-25T02:41:52.707Z';
		it('correctly short formats date', async() => {
			const actualResult = formatDateTime(dateStr);
			assert.equal(actualResult, 'Mar 24, 2021 10:41 PM');
		});

	});
	describe('getLinkIconTypeFromUrl tests', () => {
		it('correctly parses audio/videos/link urls', async() => {
			const audioUrl = 'something.com/type=audio&&moreInfo';
			const videoUrl = 'something.com/type=video&&moreInfo';
			const linkUrl = 'something.com/type=????&&moreInfo';

			assert.equal(getLinkIconTypeFromUrl(audioUrl), 'file-audio');
			assert.equal(getLinkIconTypeFromUrl(videoUrl), 'file-video');
			assert.equal(getLinkIconTypeFromUrl(linkUrl), 'link');
		});

	});
});
