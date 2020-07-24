import './consistent-evaluation-evidence.js';
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
			_evidenceUrl: {
				attribute: false,
				type: String
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

	_renderEvidence(e) {
		this._evidenceUrl = e.detail.url;
	}

	_renderSubmissionList() {
		this._evidenceUrl = undefined;
	}

	render() {
		if (submissionTypesWithNoEvidence.includes(this.submissionInfo.submissionType)) {
			return html`
			<div class="d2l-consistent-evaluation-no-evidence">
				<h2 class="d2l-heading-2">${this.localize(getSubmissionTypeName(this.submissionInfo.submissionType))}</h2>
				<p class="d2l-body-standard">${this.localize('noEvidence')}</p>
			</div>`;
		}

		if (this.submissionInfo.submissionList === undefined) {
			return html`
			<div class="d2l-consistent-evaluation-no-submissions-container">
				<div class="d2l-consistent-evaluation-no-submissions d2l-body-standard">${this.localize('noSubmissions')}</div>
			</div>`;
		}

		if (this._evidenceUrl) {
			return html`
			<d2l-consistent-evaluation-evidence
				.url=${this._evidenceUrl}
				.token=${this.token}
				@d2l-consistent-evaluation-evidence-back-to-user-submissions=${this._renderSubmissionList}
			></d2l-consistent-evaluation-evidence>`;
		} else {
			return html`
			<d2l-consistent-evaluation-submissions-page
				submission-type=${this.submissionInfo && this.submissionInfo.submissionType}
				.submissionList=${this.submissionInfo && this.submissionInfo.submissionList}
				.token=${this.token}
				@d2l-consistent-evaluation-submission-item-render-evidence=${this._renderEvidence}
			></d2l-consistent-evaluation-submissions-page>`;
		}
	}
}

customElements.define('d2l-consistent-evaluation-left-panel', ConsistentEvaluationLeftPanel);
