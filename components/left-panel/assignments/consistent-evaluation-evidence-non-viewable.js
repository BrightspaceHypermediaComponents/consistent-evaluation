import './consistent-evaluation-evidence-top-bar.js';
import { bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationEvidenceNonViewable extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			title: { type: String },
			downloadUrl: {
				attribute: 'download-url',
				type: String
			}
		};
	}

	static get styles() {
		return [bodyStandardStyles, heading2Styles, css`
			.d2l-consistent-eval-non-viewable {
				display: flex;
				flex-direction: column;
				height: 80%;
				justify-content: center;
				overflow: hidden;
				text-align: center;
			}
			.d2l-consistent-eval-non-viewable-try-text {
				margin-block-end: 0.2rem;
			}
		`];
	}

	_donwloadFile() {
		window.location = this.downloadUrl;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-evidence-top-bar>
			</d2l-consistent-evaluation-evidence-top-bar>

			<div class="d2l-consistent-eval-non-viewable">
				<h2 class="d2l-heading-2">${this.localize('fileCannotBePreviewed')}</h2>
				<p class="d2l-body-standard d2l-consistent-eval-non-viewable-try-text">${this.localize('tryDonwloadFile')}</p>
				<d2l-button-subtle class="d2l-consistent-eval-non-viewable-download"
					icon="tier1:download"
					text="${this.localize('download')}"
					description="${this.title}"
					@click="${this._donwloadFile}">
				</d2l-button-subtle>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-non-viewable', ConsistentEvaluationEvidenceNonViewable);
