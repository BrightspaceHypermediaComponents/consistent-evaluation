import { formatDate, formatTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { formatDateTime, getLinkIconTypeFromUrl } from '../../components/helpers/submissionsAndFilesHelpers.js';
import { assert } from '@open-wc/testing';

describe('submissionsAndFilesHelpers tests', () => {

	describe('formatDateTime tests', () => {
		const dateStr = '2021-03-25T02:41:52.707Z';
		it('correctly formats date', async() => {
			const mediumDate = formatDateTime(dateStr, 'medium');
			const fullDate = formatDateTime(dateStr, 'full');

			const date = new Date(dateStr);
			const formattedMediumDate = formatDate(date, { format: 'medium' });
			const formattedFullDate = formatDate(date, { format: 'full' });
			const formattedTime = formatTime(date, { format: 'short' });

			assert.equal(mediumDate, `${formattedMediumDate} ${formattedTime}`);
			assert.equal(fullDate, `${formattedFullDate} ${formattedTime}`);
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