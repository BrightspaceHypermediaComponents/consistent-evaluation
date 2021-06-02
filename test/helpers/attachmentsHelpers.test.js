import { AttachmentTypes, getAttachmentType, getReadableFileSizeString } from '../../components/helpers/attachmentsHelpers.js';
import { assert } from '@open-wc/testing';

function localizeStub(str) {
	return str;
}

describe('attachmentsHelpers tests', () => {
	describe('getAttachmentType tests', () => {

		const extensionAndExpectedTypePairs = [
			['url', AttachmentTypes.LINK],
			['html', AttachmentTypes.PAGE],
			['txt', AttachmentTypes.FILE]
		];

		for (const extensionAndExpectedTypePair of extensionAndExpectedTypePairs) {
			const extension = extensionAndExpectedTypePair[0];
			const expectedType = extensionAndExpectedTypePair[1];

			it(`should recognize '${extension}' extension as a ${expectedType} attachment type`, () => {
				const attachment = {
					properties: {
						extension
					}
				};

				const actualAttachmentType = getAttachmentType(attachment);

				assert.equal(actualAttachmentType, expectedType);
			});
		}
	});

	describe('getReadableFileSizeString tests', () => {
		it('should use kB when < 1024 bytes', () => {
			const readableFileSizeString = getReadableFileSizeString(512, localizeStub);

			assert.equal('0.5kB', readableFileSizeString);
		});

		it('should use kB when > 1024 bytes and < 1024^2 bytes', () => {
			const readableFileSizeString = getReadableFileSizeString(Math.pow(1024, 2) / 2, localizeStub);

			assert.equal('512.0kB', readableFileSizeString);
		});

		it('should use MB when > 1024^2 bytes and < 1024^3 bytes', () => {
			const readableFileSizeString = getReadableFileSizeString(Math.pow(1024, 3) / 2, localizeStub);

			assert.equal('512.0MB', readableFileSizeString);
		});

		it('should use GB when > 1024^3 bytes', () => {
			const readableFileSizeString = getReadableFileSizeString(Math.pow(1024, 3) * 2, localizeStub);

			assert.equal('2.0GB', readableFileSizeString);
		});
	});
});
