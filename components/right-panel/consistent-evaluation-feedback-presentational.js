import 'd2l-activities/components/d2l-activity-editor/d2l-activity-text-editor.js';
import './consistent-evaluation-right-panel-block';
import './consistent-evaluation-attachments-editor.js';
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import { css, html, LitElement } from 'lit-element';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

class ConsistentEvaluationFeedbackPresentational extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			attachmentsHref: {
				attribute: 'attachments-href',
				type: String
			},
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
				type: Object
			},
			_key: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
		`;
	}

	constructor() {
		super();

		this.canEditFeedback = false;
		this._debounceJobs = {};
		this.flush = this.flush.bind(this);
		this.attachmentsHref = null;
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

	render() {
		if (this.href && this.token) {
			const attachments = this.attachmentsHref !== null
				? html`
					<div>
						<d2l-consistent-evaluation-attachments-editor
							href=${this.attachmentsHref}
							.token="${this.token}"
							destinationHref="${this.href}"
							.canEditFeedback="${this.canEditFeedback}">
						</d2l-consistent-evaluation-attachments-editor>
					</div>`
				: null;

			return html`
					<d2l-consistent-evaluation-right-panel-block title="${this.localize('overallFeedback')}">
						<d2l-activity-text-editor
							.key="${this._key}"
							.value="${this.feedbackText}"
							.richtextEditorConfig="${this.richTextEditorConfig}"
							@d2l-activity-text-editor-change="${this._saveOnFeedbackChange}"
							ariaLabel="${this.localize('overallFeedback')}">
						</d2l-activity-text-editor>
						${attachments}
					</d2l-consistent-evaluation-right-panel-block>
			`;
		} else {
			return html``;
		}
	}
}

customElements.define('d2l-consistent-evaluation-feedback-presentational', ConsistentEvaluationFeedbackPresentational);
