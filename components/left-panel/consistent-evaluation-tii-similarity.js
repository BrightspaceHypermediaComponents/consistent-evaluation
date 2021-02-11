import '@brightspace-ui/core/components/button/button-icon.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import { bodyCompactStyles, heading4Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { tiiErrorStatus, tiiPendingReportStatus, tiiPendingRetrievalStatus, tiiReportCompleteStatus, tiiReportNotSubmitted } from '../controllers/constants.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationTiiSimilarity extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			colour: {
				type: String
			},
			errorMessage: {
				attribute: 'error-message',
				type: String
			},
			fileId: {
				attribute: 'file-id',
				type: String
			},
			fileName: {
				attribute: 'file-name',
				type: String
			},
			originalityReportHref : {
				attribute: 'originality-report-href',
				type: String
			},
			reportStatus: {
				attribute: 'report-status',
				type: String
			},
			score: {
				type: Number
			},
			submitFileHref : {
				attribute: 'submit-file-href',
				type: String
			}
		};
	}

	static get styles() {
		return [bodyCompactStyles, heading4Styles, labelStyles, css`
			.d2l-consistent-evaluation-tii-similarity-bar {
				cursor: pointer;
				display: flex;
				margin-top: 0.5rem;
				width: 5.25rem;
			}
			.d2l-consistent-evaluation-tii-similarity-bar:hover {
				background-color: #e1f3fd;
			}
			.d2l-consistent-evaluation-tii-similarity-score {
				border: 0.05rem solid;
				height: 1.35rem;
				padding-left: 0.25rem;
				padding-top: 0.1rem;
				width: 3.75rem;
			}
			.d2l-consistent-evaluation-tii-similarity-colour {
				border: 0.05rem solid;
				height: 1.45rem;
				width: 1.25rem;
			}
		`];
	}

	_onErrorClick() {
		const dialog = this.shadowRoot.querySelector('d2l-dialog');
		if (dialog) {
			dialog.opened = true;
		}
	}

	_onSimilarityBarClick() {
		window.open(this.originalityReportHref);
	}

	async _onSubmitFileClick() {
		const event = new CustomEvent('d2l-consistent-evaluation-evidence-tii-submit-file-action', {
			detail: {
				fileId: this.fileId,
			},
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);

		this.reportStatus = tiiPendingReportStatus;
		await this.requestUpdate();
	}

	_renderSimilarityStatus() {
		if (this.reportStatus !== tiiReportCompleteStatus) {
			return html``;
		} else if (isNaN(this.score)) {
			return html`
				<div class="d2l-body-compact" title="${this.localize('turnitinNoReportDescription')}">${this.localize('turnitinNoReport')}</div>
			`;
		}
		const renderScore = Math.round(this.score * 100);

		return html`
			<a
				class="d2l-consistent-evaluation-tii-similarity-bar"
				@click=${this._onSimilarityBarClick}
				title="${this.localize('turnitinViewReport', 'file', this.fileName)}"
				aria-label="${this.localize('turnitinPercentSimilar', 'percent', renderScore)}"
				tabindex=0
			>
				<div class="d2l-consistent-evaluation-tii-similarity-score">${renderScore}%</div>
				<div class="d2l-consistent-evaluation-tii-similarity-colour" style="background-color:${this.colour};"></div>
			</a>
		`;
	}

	_renderError() {
		if (this.reportStatus === tiiErrorStatus) {

			let errorMessage = this.errorMessage;
			if (!errorMessage) {
				errorMessage = this.localize('turnitinDefaultErrorMessage');
			}

			return html`
				<d2l-button-icon
					text="${errorMessage}"
					icon="tier1:alert"
					@click=${this._onErrorClick}
				></d2l-button-icon>

				<d2l-dialog title-text="${this.localize('warning')}">
					<div class="d2l-heading-4">${this.localize('turnitinReportNotGenerated')}</div>
					<div class="d2l-body-compact">${this.localize('turnitinErrorMessagePrefix')} ${errorMessage}</div>
					<d2l-button slot="footer" primary data-dialog-action="done">${this.localize('ok')}</d2l-button>
				</d2l-dialog>
			`;
		}
	}

	_renderSubmitFile() {
		if (this.reportStatus === tiiReportNotSubmitted || this.reportStatus === tiiErrorStatus) {
			return html`
				<d2l-button-icon
					text="${this.localize('turnitinSubmitFile')}"
					icon="tier2:upload"
					@click=${this._onSubmitFileClick}
				></d2l-button-icon>
			`;
		} else if (this.reportStatus === tiiPendingReportStatus || this.reportStatus === tiiPendingRetrievalStatus) {
			return html`
				<div class="d2l-body-compact">${this.localize('inProgress')}</div>
			`;
		} else {
			return html``;
		}
	}

	render() {
		return html`
			<div class="d2l-label-text">${this.localize('turnitinSimilarity')}</div>

			${this._renderSimilarityStatus()}
			${this._renderError()}
			${this._renderSubmitFile()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-tii-similarity', ConsistentEvaluationTiiSimilarity);
