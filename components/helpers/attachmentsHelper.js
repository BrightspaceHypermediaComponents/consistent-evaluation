export const AttachmentTypes = {
	FILE: 'file',
	LINK: 'link',
	PAGE: 'page'
};

export function getAttachmentType(attachment) {
	switch (attachment.properties.extension) {
		case 'url':
			return AttachmentTypes.LINK;
		case 'html':
			return AttachmentTypes.PAGE;
		default:
			return AttachmentTypes.FILE;
	}
}

export function getReadableFileSizeString(fileSizeBytes, localize) {
	let i = -1;
	const byteUnits = ['kB', 'MB', 'GB'];
	do {
		fileSizeBytes = fileSizeBytes / 1024;
		i++;
	} while (fileSizeBytes > 1024);
	const unit = localize(byteUnits[i]);
	return Math.max(fileSizeBytes, 0.1).toFixed(1) + unit;
}
