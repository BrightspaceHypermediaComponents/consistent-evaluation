import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { formatDate, formatTime } from '@brightspace-ui/intl/lib/dateTime.js';

export function findFile(fileId, submissions) {
	for (let i = 0; i < submissions.length; i++) {
		const submission = submissions[i];
		const files = getSubmissionFiles(submission);
		for (let j = 0; j < files.length; j++) {
			const submissionFile = files[j];
			if (submissionFile.properties.id === fileId) {
				return submissionFile;
			}
		}
	}
}

export function getSubmissionFiles(submission) {
	const attachments = submission.entity.getSubEntityByRel(Rels.Assignments.attachmentList);
	return attachments.entities.map(sf => {
		if (submission.entity.getSubEntityByClass(Classes.assignments.submissionComment)) {
			const submissionComment = submission.entity.getSubEntityByClass(Classes.assignments.submissionComment);
			if (submissionComment.properties.html) {
				sf.properties.comment = submissionComment.properties.html;
			} else {
				sf.properties.comment = submissionComment.properties.text;
			}
		}

		if (submission.entity.getSubEntityByClass(Classes.assignments.submissionDate)) {
			sf.properties.latenessTimespan = submission.entity.properties.lateTimeSpan;
		}
		sf.properties.date = submission.entity.getSubEntityByClass(Classes.assignments.submissionDate).properties.date;
		sf.properties.displayNumber = submission.submissionNumber;
		return sf;
	});
}

export async function getSubmissions(submissionInfo, token) {
	if (submissionInfo && submissionInfo.submissionList) {
		const totalSubmissions = submissionInfo.submissionList.length;

		const submissionEntities = submissionInfo.submissionList.map(async(sub, index) => {
			const file = await window.D2L.Siren.EntityStore.fetch(sub.href, token, false);
			file.submissionNumber = totalSubmissions - index;
			return file;
		});
		return Promise.all(submissionEntities);
	}
}

export function formatDateTime(dateStr, dateFormatType) {
	const date = dateStr ? new Date(dateStr) : undefined;

	const formattedDate = (date) ? formatDate(
		date,
		{ format: dateFormatType }) : '';
	const formattedTime = (date) ? formatTime(
		date,
		{ format: 'short' }) : '';
	return `${formattedDate} ${formattedTime}`;
}

export function getLinkIconTypeFromUrl(url) {
	const lowerCaseUrl = url.toLowerCase();
	if (lowerCaseUrl.includes('type=audio')) {
		return 'file-audio';
	} else if (lowerCaseUrl.includes('type=video')) {
		return 'file-video';
	} else {
		return 'link';
	}
}
