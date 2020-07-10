import 'd2l-activities/components/d2l-activity-editor/d2l-activity-text-editor.js';
import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-editor.js';
import './consistent-evaluation-right-panel-block';
import { html, LitElement } from 'lit-element';
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
				attribute: 'feedback-text',
				type: String
			},
			href: {
				type: String
			},
			richTextEditorConfig: {
				attribute: 'rich-text-editor-config',
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
		this.feedbackText = '';

		this._debounceJobs = {};
	}

	_saveOnFeedbackChange(e) {
		const feedback = e.detail.content;

		this._debounceJobs.feedback = Debouncer.debounce(
			this._debounceJobs.feedback,
			timeOut.after(500),
			() => this._emitFeedbackEditEvent(feedback)
		);
	}

	_emitFeedbackEditEvent(feedback) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-on-feedback-edit', {
			composed: true,
			bubbles: true,
			detail: feedback
		}));
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block title="${this.localize('overallFeedback')}">
				<d2l-activity-text-editor
					.value="${this.feedbackText}"
					.richtextEditorConfig="${this.richTextEditorConfig}"
					ariaLabel="${this.localize('overallFeedback')}"
					?disabled="${!this.canEditFeedback}">
				</d2l-activity-text-editor>

				<div ?hidden="${!this.href}">
					<d2l-activity-attachments-editor
						href="${this.href}"
						.token="${this.token}">
					</d2l-activity-attachments-editor>
				</div>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-feedback-presentational', ConsistentEvaluationFeedbackPresentational);
