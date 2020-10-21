import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { attachmentListRel } from '../controllers/constants';
import { Classes } from 'd2l-hypermedia-constants';

export class SubmissionsAndFilesHelpers  {

	constructor(token) {
		this.token = token;
	}

	getSubmissionFiles(submission) {
		const attachments = submission.entity.getSubEntityByRel(attachmentListRel);
		return attachments.entities.map(sf => {
			if (submission.entity.getSubEntityByClass(Classes.assignments.submissionComment)) {
				sf.properties.comment = submission.entity.getSubEntityByClass(Classes.assignments.submissionComment).properties.html;
			}
			sf.properties.date = submission.entity.getSubEntityByClass(Classes.assignments.submissionDate).properties.date;
			sf.properties.displayNumber = submission.submissionNumber;
			return sf.properties;
		});
	}

	async getSubmissions(submissionInfo) {
		if (submissionInfo && submissionInfo.submissionList) {
			const totalSubmissions = submissionInfo.submissionList.length;

			const submissionEntities = submissionInfo.submissionList.map(async(sub, index) => {
				const file = await window.D2L.Siren.EntityStore.fetch(sub.href, this.token, false);
				file.submissionNumber = totalSubmissions - index;
				return file;
			});
			return Promise.all(submissionEntities);
		}
	}
}
