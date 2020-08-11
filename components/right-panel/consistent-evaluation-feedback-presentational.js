import 'd2l-activities/components/d2l-activity-editor/d2l-activity-text-editor.js';
import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-editor.js';
import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-list.js';
import './consistent-evaluation-right-panel-block';
import 'd2l-polymer-siren-behaviors/store/entity-store.js';

import { html, LitElement } from 'lit-element';
import { AttachmentCollectionEntity } from 'siren-sdk/src/activities/AttachmentCollectionEntity.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

class ConsistentEvaluationFeedbackPresentational extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			canEditFeedback: {
				attribute: 'can-edit-feedback',
				type: Boolean
			},
			feedbackText: {
				attribute: false
			},
			href: {
				type: String
			},
			richTextEditorConfig: {
				attribute: false,
				type: Object
			},
			token: {
				type: String
			}
		};
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();

		this.canEditFeedback = false;
		this._debounceJobs = {};
		this.addEventListener('d2l-request-provider',
			e => {
				if (e.detail.key === 'd2l-provider-html-editor-enabled') e.detail.provider = true;
			});
	}

	_saveOnFeedbackChange(e) {
		const feedback = e.detail.content;

		this._debounceJobs.feedback = Debouncer.debounce(
			this._debounceJobs.feedback,
			timeOut.after(800),
			() => this._emitFeedbackEditEvent(feedback)
		);
	}

	_emitFeedbackEditEvent(feedback) {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-edit', {
			composed: true,
			bubbles: true,
			detail: feedback
		}));
	}
	async saveAttachment(e) {
		const files = e.detail.files;
		files.forEach(async file => {
			const fileSystemType = file.m_fileSystemType;
			const fileId = file.m_id;

			const sirenEntity = await window.D2L.Siren.EntityStore.get(this.href, this.token);
			const link = sirenEntity.getLinkByRel('https://activities.api.brightspace.com/rels/attachments');
			const entitytemp = await window.D2L.Siren.EntityStore.fetch(link, this.token);

			const entity = new AttachmentCollectionEntity(entitytemp.entity, this.token);
			await entity.addFileAttachment(fileSystemType, fileId);
		});

	}

	async deleteAttachment() {
		await this.shadowRoot.querySelector('d2l-activity-attachments-editor').save();
	}

	render() {
		if (this.href && this.token) {

			return html`
			<d2l-consistent-evaluation-right-panel-block title="${this.localize('overallFeedback')}">
				<d2l-activity-text-editor
					.value="${this.feedbackText}"
					.richtextEditorConfig="${this.richTextEditorConfig}"
					@d2l-activity-text-editor-change="${this._saveOnFeedbackChange}"
					ariaLabel="${this.localize('overallFeedback')}"
					?hidden="${!this.canEditFeedback}">
				</d2l-activity-text-editor>

				<div>
					<d2l-activity-attachments-editor
						.href="${this.href}/attachments"
						.token="${this.token}"
						@d2l-activity-attachments-picker-files-uploaded="${this.saveAttachment}"
						@d2l-activity-attachments-picker-video-uploaded="${this.saveAttachment}"
						@d2l-activity-attachments-picker-audio-uploaded="${this.saveAttachment}"
						@d2l-attachment-removed="${this.deleteAttachment}"
						?disabled="${!this.canEditFeedback}">
					</d2l-activity-attachments-editor>
				</div>
			</d2l-consistent-evaluation-right-panel-block>
		`;
		} else {
			return html``;
		}
	}
}

customElements.define('d2l-consistent-evaluation-feedback-presentational', ConsistentEvaluationFeedbackPresentational);
