import './consistent-evaluation-evidence-file.js';
import './consistent-evaluation-evidence-text.js';
import './consistent-evaluation-submissions-page.js';
import { bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { fileSubmission, observedInPerson, onPaperSubmission, submissionTypesWithNoEvidence, textSubmission } from '../controllers/constants';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';

function getSubmissionTypeName(type) {
	switch (type) {
		case fileSubmission:
			return 'fileSubmission';
		case textSubmission:
			return 'textSubmission';
		case observedInPerson:
			return 'observedInPerson';
		case onPaperSubmission:
			return 'onPaperSubmission';
		default:
			console.error(`Consistent-Eval: Unknown submission type "${type}"`);
	}
}

export class ConsistentEvaluationLeftPanel extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			submissionInfo: {
				attribute: false,
				type: Object
			},
			token: { type: String },
			_fileEvidenceUrl: {
				attribute: false,
				type: String
			},
			_textEvidence: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return [bodyStandardStyles, heading2Styles, css`
			d2l-consistent-evaluation-evidence {
				overflow: hidden;
			}

			.d2l-consistent-evaluation-no-evidence {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
				margin: 0 1rem;
				text-align: center;
			}

			.d2l-consistent-evaluation-no-submissions-container {
				background: white;
				border-radius: 0.3rem;
				border: 1px solid var(--d2l-color-gypsum);
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-submissions {
				background: var(--d2l-color-regolith);
				border-radius: 0.3rem;
				border: 1px solid var(--d2l-color-gypsum);
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}

			d2l-consistent-evaluation-submissions-page {
				width: 100%;
			}
		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	_showFileEvidence(e) {
		this._fileEvidenceUrl = e.detail.url;

		const event = new CustomEvent('d2l-consistent-evaluation-left-panel-render-evidence', {
			composed: true
		});
		this.dispatchEvent(event);
	}

	_showTextEvidence(e) {
		this._textEvidence = e.detail.textSubmissionEvidence;

		const event = new CustomEvent('d2l-consistent-evaluation-left-panel-render-evidence', {
			composed: true
		});
		this.dispatchEvent(event);
	}

	_showSubmissionList() {
		this._fileEvidenceUrl = undefined;
		this._textEvidence = undefined;

		const event = new CustomEvent('d2l-consistent-evaluation-left-panel-render-submission-list', {
			composed: true
		});
		this.dispatchEvent(event);
	}

	_renderFileEvidence() {
		return html`
		<d2l-consistent-evaluation-evidence-file
			.url=${this._fileEvidenceUrl}
			.token=${this.token}
			@d2l-consistent-evaluation-evidence-back-to-user-submissions=${this._showSubmissionList}
		></d2l-consistent-evaluation-evidence-file>`;
	}

	_renderNoEvidenceSubmissionType() {
		return html`
		<div class="d2l-consistent-evaluation-no-evidence">
			<h2 class="d2l-heading-2">${this.localize(getSubmissionTypeName(this.submissionInfo.submissionType))}</h2>
			<p class="d2l-body-standard">${this.localize('noEvidence')}</p>
		</div>`;
	}

	_renderNoSubmissions() {
		return html`
		<div class="d2l-consistent-evaluation-no-submissions-container">
			<div class="d2l-consistent-evaluation-no-submissions d2l-body-standard">${this.localize('noSubmissions')}</div>
		</div>`;
	}

	_renderSubmissionList() {
		return html`
		<d2l-consistent-evaluation-submissions-page
			submission-type=${this.submissionInfo && this.submissionInfo.submissionType}
			.submissionList=${this.submissionInfo && this.submissionInfo.submissionList}
			.token=${this.token}
			@d2l-consistent-evaluation-submission-item-render-evidence-file=${this._showFileEvidence}
			@d2l-consistent-evaluation-submission-item-render-evidence-text=${this._showTextEvidence}
		></d2l-consistent-evaluation-submissions-page>`;
	}

	_renderTextEvidence() {
		return html`
		<d2l-consistent-evaluation-evidence-text
			title=${this._textEvidence.title}
			date=${this._textEvidence.date}
			download-url=${this._textEvidence.downloadUrl}
			.content=${this._textEvidence.content}
			@d2l-consistent-evaluation-evidence-back-to-user-submissions=${this._showSubmissionList}
		></d2l-consistent-evaluation-evidence-text>`;
	}

	render() {
		if (submissionTypesWithNoEvidence.includes(this.submissionInfo.submissionType)) {
			return this._renderNoEvidenceSubmissionType();
		}

		if (this.submissionInfo.submissionList === undefined) {
			return this._renderNoSubmissions();
		}

		if (this._fileEvidenceUrl) {
			return this._renderFileEvidence();
		}

		if (this._textEvidence) {
			return this._renderTextEvidence();
		}

		return this._renderSubmissionList();
	}
}

customElements.define('d2l-consistent-evaluation-left-panel', ConsistentEvaluationLeftPanel);
