import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-picker.js';
import '@d2l/d2l-attachment/components/attachment-list';
import '@d2l/d2l-attachment/components/attachment';
import { css, html } from 'lit-element/lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';

class ConsistentEvaluationAttachmentsEditor extends MobxLitElement {
	static get properties() {
		return {
			attachments: {
				attribute: false
			},
			canEditFeedback: {
				attribute: 'can-edit-feedback',
				type: Boolean
			},
			canAddFile: {
				attribute: 'can-add-file',
				type: Boolean
			},
			canRecordVideo: {
				attribute: 'can-record-video',
				type: Boolean
			},
			canRecordAudio: {
				attribute: 'can-record-audio',
				type: Boolean
			},
			canAddFeedbackLink: {
				attribute: 'allow-add-link',
				type: Boolean
			},
			canAddFeedbackGoogleDriveLink: {
				attribute: 'allow-add-link-google-drive',
				type: Boolean
			},
			canAddFeedbackOneDriveLink: {
				attribute: 'allow-add-link-one-drive',
				type: Boolean
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			d2l-labs-attachment {
				margin-bottom: 20px;
			}
		`;
	}

	render() {
		const attachmentComponents = this.attachments.map(attachment => {
			return html`<li slot="attachment" class="panel">
				<d2l-labs-attachment
					attachmentId="${attachment.id}"
					.attachment="${attachment}"
					?editing="${attachment.canDeleteAttachment}"></d2l-labs-attachment>
				</d2l-labs-attachment>
				</li>`;
		});

		return html`
			<d2l-labs-attachment-list
				editing="${this.canEditFeedback}"
				@d2l-attachment-removed="${this._dispatchRemoveAttachmentEvent}">
				${attachmentComponents}
			</d2l-labs-attachment-list>
			<div ?hidden="${!this.canEditFeedback}">
				<d2l-activity-attachments-picker-presentational
					?can-add-file="${this.canAddFile}"
					?can-add-link="${this.canAddFeedbackLink}"
					?can-add-googledrive-link="${this.canAddFeedbackGoogleDriveLink}"
					?can-add-onedrive-link="${this.canAddFeedbackOneDriveLink}"
					?can-record-video="${this.canRecordVideo}"
					?can-record-audio="${this.canRecordAudio}"
					@d2l-activity-attachments-picker-files-uploaded="${this._dispatchAddAttachmentEvent}"
					@d2l-activity-attachments-picker-link-dialog-opened="${this._dispatchAddAttachmentLinkEvent}"
					@d2l-activity-attachments-picker-quicklink-dialog-opened="${this._dispatchAddAttachmentQuickLinkEvent}"
					@d2l-activity-attachments-picker-googledrive-link-dialog-opened="${this._dispatchAddAttachmentLinkEvent}"
					@d2l-activity-attachments-picker-onedrive-link-dialog-opened="${this._dispatchAddAttachmentLinkEvent}"
					@d2l-activity-attachments-picker-video-uploaded="${this._dispatchAddAttachmentEvent}"
					@d2l-activity-attachments-picker-audio-uploaded="${this._dispatchAddAttachmentEvent}">
				</d2l-activity-attachments-picker-presentational>
			</div>
		`;
	}

	_dispatchAddAttachmentEvent(e) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-attachments-add', {
			composed: true,
			bubbles: true,
			detail: {
				files: e.detail.files
			}
		}));
	}

	_dispatchAddAttachmentLinkEvent(e) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-attachments-add-link', {
			composed: true,
			bubbles: true,
			detail: {
				title: e.detail.title,
				url: e.detail.url
			}
		}));
	}

	async _dispatchAddAttachmentQuickLinkEvent(e) {
		const quickLinkEvent = e.detail.event;
		const quickLink = await this._getQuickLink(quickLinkEvent);
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-attachments-add-link', {
			composed: true,
			bubbles: true,
			detail: {
				title: quickLinkEvent.m_title,
				url: quickLink
			}
		}));
	}

	_dispatchRemoveAttachmentEvent(e) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-attachments-remove', {
			composed: true,
			bubbles: true,
			detail: {
				file: e.detail
			}
		}));
	}

	async _getQuickLink(e) {
		if (e.m_typeKey === this._sources.url) {
			return e.m_url;
		}

		const isRemotePlugin = Boolean(
			e.m_url &&
			e.m_url.length > 0 &&
			!Object.values(this._sources).includes(e.m_typeKey)
		);

		if (isRemotePlugin) {
			if (/^(http|https|ftp):\/\//i.test(e.m_url)) {
				return e.m_url;
			} else {
				return decodeURIComponent(e.m_url);
			}
		}

		const orgUnitId = JSON.parse(document.documentElement.getAttribute('data-he-context')).orgUnitId;
		const quicklinkUrl = `/d2l/api/lp/unstable/${orgUnitId}/quickLinks/${e.m_typeKey}/${e.m_id}`;
		const response = await fetch(quicklinkUrl);
		const json = await response.json();
		return json.QuickLink;
	}

	get _sources() {
		return {
			announcement: 'news',
			assignment: 'dropbox',
			calendar: 'schedule',
			chat: 'chat',
			checklist: 'checklist',
			content: 'content',
			courseFile: 'coursefile',
			discussion: 'discuss',
			ePortfolio: 'epobject',
			formTemplate: 'form',
			googleDrive: 'google-drive',
			lti: 'lti',
			oneDrive: 'one-drive',
			quiz: 'quiz',
			selfAssessment: 'selfassess',
			survey: 'survey',
			url: 'url'
		};
	}

}
customElements.define('d2l-consistent-evaluation-attachments-editor', ConsistentEvaluationAttachmentsEditor);
