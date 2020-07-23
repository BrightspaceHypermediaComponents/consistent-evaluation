import './consistent-evaluation-evidence.js';
import './consistent-evaluation-submissions-page.js';
import { css, html, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { submissionTypesWithNoEvidence } from '../controllers/constants';

export class ConsistentEvaluationLeftPanel extends LitElement {

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
		return css`
			d2l-consistent-evaluation-evidence {
				overflow: hidden;
			}

			.d2l-consistent-evaluation-no-evidence {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: calc(100% - 2.7rem);
				justify-content: center;
				margin: 0 1rem;
				text-align: center;
			}

			.consistent-evaluation-no-evidence-image {
				width: 100%;
			}

			.d2l-consistent-evaluation-no-submissions-container {
				background: white;
				border-radius: 0.3rem;
				border: 1px solid var(--d2l-color-gypsum);
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
				width: 100%;
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
		`;
	}

	constructor() {
		super();

		this._evidenceUrl = undefined;
	}

	connectedCallback() {
		this.addEventListener('d2l-consistent-evaluation-submission-item-render-evidence', this._renderEvidence);
		this.addEventListener('d2l-consistent-evaluation-evidence-back-to-user-submissions', this._renderSubmissionList);
		super.connectedCallback();
	}

	disconnectedCallback() {
		this.removeEventListener('d2l-consistent-evaluation-submission-item-render-evidence', this._renderEvidence);
		this.removeEventListener('d2l-consistent-evaluation-evidence-back-to-user-submissions', this._renderSubmissionList);
		super.disconnectedCallback();
	}

	_renderEvidence(e) {
		this._evidenceUrl = e.detail.url;
	}

	_renderSubmissionList() {
		this._evidenceUrl = undefined;
	}

	render() {
		const noEvidence = 'There is no evidence uploaded for this submission type';
		const noSubmissions = 'No submissions made for this assignment';
		if(this.submissionInfo.submissionList == undefined) {
			return html`${submissionTypesWithNoEvidence.includes(this.submissionInfo.submissionType) ?
				html`
				<div class="d2l-consistent-evaluation-no-evidence">
					<img class="consistent-evaluation-no-evidence-image" src="https://www.clker.com/cliparts/T/B/q/X/i/r/moose.svg"></img>
					<h1>${this.submissionInfo.submissionType}</h1>
					<p>${noEvidence}</p>
				</div>` :
				html`
				<div class="d2l-consistent-evaluation-no-submissions-container">
					<div class="d2l-consistent-evaluation-no-submissions">${noSubmissions}</div>
				</div>`
			}`;
		}

		if (this._evidenceUrl) {
			return html`
			<d2l-consistent-evaluation-evidence
				.url=${this._evidenceUrl}
				.token=${this.token}
			></d2l-consistent-evaluation-evidence>`;
		} else {
			return html`
			<d2l-consistent-evaluation-submissions-page
				due-date=${ifDefined(this.submissionInfo && this.submissionInfo.dueDate)}
				evaluation-state=${this.submissionInfo && this.submissionInfo.evaluationState}
				submission-type=${this.submissionInfo && this.submissionInfo.submissionType}
				.submissionList=${this.submissionInfo && this.submissionInfo.submissionList}
				.token=${this.token}
			></d2l-consistent-evaluation-submissions-page>`;
		}
	}
}

customElements.define('d2l-consistent-evaluation-left-panel', ConsistentEvaluationLeftPanel);
