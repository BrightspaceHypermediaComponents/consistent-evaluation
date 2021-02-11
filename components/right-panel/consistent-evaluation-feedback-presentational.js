import 'd2l-activities/components/d2l-activity-editor/d2l-activity-text-editor.js';
import './consistent-evaluation-right-panel-block';
import './consistent-evaluation-attachments-editor.js';
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { html, LitElement } from 'lit-element';
import { convertToken } from '../helpers/converterHelpers.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

class ConsistentEvaluationFeedbackPresentational extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
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
			feedbackText: {
				attribute: false
			},
			attachments: {
				attribute: false
			},
			href: {
				type: String
			},
			richTextEditorConfig: {
				attribute: false,
				type: Object
			},
			useNewHtmlEditor: {
				attribute: 'use-new-html-editor',
				type: Boolean
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			_key: {
				type: String
			},
			_feedbackSummaryInfo: {
				type: String
			}
		};
	}

	constructor() {
		super();

		this.canEditFeedback = false;
		this.canAddFile = false;
		this.canRecordVideo = false;
		this.canRecordAudio = false;
		this.useNewHtmlEditor = false;
		this._debounceJobs = {};
		this.flush = this.flush.bind(this);
	}

	htmlEditorEnabled(e) {
		if (e.detail.key === 'd2l-provider-html-editor-enabled') {
			e.detail.provider = true;
		}
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-request-provider', this.htmlEditorEnabled);
		window.addEventListener('d2l-flush', this.flush);
	}

	disconnectedCallback() {
		this.removeEventListener('d2l-request-provider', this.htmlEditorEnabled);
		window.removeEventListener('d2l-flush', this.flush);
		super.disconnectedCallback();
	}

	flush() {
		if (this._debounceJobs.feedback && this._debounceJobs.feedback.isActive()) {
			this._debounceJobs.feedback.flush();
		}
	}

	_saveOnFeedbackChange(e) {
		const feedback = e.detail.content;
		this._emitFeedbackTextEditorChangeEvent();
		this._debounceJobs.feedback = Debouncer.debounce(
			this._debounceJobs.feedback,
			timeOut.after(800),
			() => this._emitFeedbackEditEvent(feedback)
		);
	}

	_saveOnFeedbackChangeNewEditor() {
		const feedback = this.shadowRoot.querySelector('d2l-htmleditor').html;
		if (this.feedbackText === feedback) {
			return;
		}
		this._emitFeedbackTextEditorChangeEvent();
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

	_emitFeedbackTextEditorChangeEvent() {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-feedback-text-editor-change', {
			composed: true,
			bubbles: true
		}));
	}

	updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('feedbackText')) {
			this._key = this.href;
		}
	}

	_setFeedbackSummaryInfo() {
		let summary = '';
		if (this.feedbackText === null || this.feedbackText === '') {
			summary = this.localize('noFeedbackSummary');
		} else {
			const tmpDiv = document.createElement('div');
			tmpDiv.innerHTML = this.feedbackText;
			summary = tmpDiv.textContent || tmpDiv.innerText || '';
		}
		this._feedbackSummaryInfo = summary;
	}

	_getHtmlEditor() {
		if (this.useNewHtmlEditor) {
			import('@brightspace-ui/htmleditor/htmleditor.js');
			return html `
				<d2l-htmleditor
					html="${this.feedbackText}"
					label="${this.localize('overallFeedback')}"
					label-hidden
					paste-local-images
					height="15rem"
					@d2l-htmleditor-blur="${this._saveOnFeedbackChangeNewEditor}">
				</d2l-htmleditor>
			`;
		} else {
			return html `
				<d2l-activity-text-editor
					.key="${this._key}"
					.value="${this.feedbackText}"
					.richtextEditorConfig="${this.richTextEditorConfig}"
					@d2l-activity-text-editor-change="${this._saveOnFeedbackChange}"
					ariaLabel="${this.localize('overallFeedback')}">
				</d2l-activity-text-editor>
			`;
		}
	}

	render() {
		if (this.href && this.token && this.richTextEditorConfig) {
			const attachmentsComponent = this.canEditFeedback || this.attachments.length !== 0
				? html`
					<div>
						<d2l-consistent-evaluation-attachments-editor
							.attachments=${this.attachments}
							.canEditFeedback="${this.canEditFeedback}"
							.canAddFile="${this.canAddFile}"
							.canRecordVideo="${this.canRecordVideo}"
							.canRecordAudio="${this.canRecordAudio}">
						</d2l-consistent-evaluation-attachments-editor>
					</div>`
				: null;
			this._setFeedbackSummaryInfo();
			return html`
				<d2l-consistent-evaluation-right-panel-block
					supportingInfo=${ifDefined(this._feedbackSummaryInfo)}
					title="${this.localize('overallFeedback')}">
						${this._getHtmlEditor()}
						${attachmentsComponent}
				</d2l-consistent-evaluation-right-panel-block>
			`;
		} else {
			return html``;
		}
	}
}

customElements.define('d2l-consistent-evaluation-feedback-presentational', ConsistentEvaluationFeedbackPresentational);
