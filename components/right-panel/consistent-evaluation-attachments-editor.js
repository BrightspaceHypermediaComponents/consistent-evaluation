import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-picker.js';
import '@d2l/d2l-attachment/components/attachment-list';
import '@d2l/d2l-attachment/components/attachment';
import { css, html, LitElement } from 'lit-element/lit-element';

class ConsistentEvaluationAttachmentsEditor extends LitElement {
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

	_dispatchAddAttachmentEvent(e) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-attachments-add', {
			composed: true,
			bubbles: true,
			detail: {
				files: e.detail.files
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
					?can-record-video="${this.canRecordVideo}"
					?can-record-audio="${this.canRecordAudio}"
					@d2l-activity-attachments-picker-files-uploaded="${this._dispatchAddAttachmentEvent}"
					@d2l-activity-attachments-picker-video-uploaded="${this._dispatchAddAttachmentEvent}"
					@d2l-activity-attachments-picker-audio-uploaded="${this._dispatchAddAttachmentEvent}">
				</d2l-activity-attachments-picker-presentational>
			</div>
`;
	}
}
customElements.define('d2l-consistent-evaluation-attachments-editor', ConsistentEvaluationAttachmentsEditor);
