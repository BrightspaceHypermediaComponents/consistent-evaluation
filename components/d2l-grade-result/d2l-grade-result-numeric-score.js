import '@brightspace-ui/core/components/inputs/input-text';
import { bodyStandardStyles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';

export class D2LGradeResultNumericScore extends LitElement {
	static get properties() {
		return {
			scoreNumerator: { type: Number },
			scoreDenominator: { type: Number },
			readOnly: { type: Boolean }
		};
	}

	static get styles() {
		return [bodyStandardStyles, labelStyles, inputLabelStyles, css`
			.d2l-grade-result-numeric-score-container {
				display: flex;
				flex-direction: row;
				align-items: center;
			}
			.d2l-grade-result-numeric-score-score {
				max-width: 5.25rem;
			}
			.d2l-grade-result-numeric-score-score-read-only {
				max-width: 5.25rem;
				margin-right: 0.5rem;
			}
			.d2l-grade-result-numeric-score-score-text {
				width: 2.8rem;
				text-align: center;
			}
		`];
	}

	_onGradeChange(e) {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-grade-change', {
			bubbles: true,
			composed: true,
			detail: {
				value: e.target.value
			}
		}));
	}

	render() {
		return html`
			<div class="d2l-grade-result-numeric-score-container">

				${!this.readOnly ? html`
					<div class="d2l-grade-result-numeric-score-score">
						<d2l-input-text
							type="number"
							value="${this.scoreNumerator}"
							min="0"
							@change=${this._onGradeChange}
						></d2l-input-text>
					</div>

					<div class="d2l-grade-result-numeric-score-score-text">
						${this.scoreDenominator ? html`
							<span class="d2l-body-standard">/ ${this.scoreDenominator}</span>
						` : html``}
					</div>
				` : html`
					<div class="d2l-grade-result-numeric-score-score-read-only">
						<span class="d2l-body-standard">${this.scoreNumerator ? this.scoreNumerator : 0} / ${this.scoreDenominator}</span>
					</div>
				`}

			</div>
		`;
	}
}

customElements.define('d2l-grade-result-numeric-score', D2LGradeResultNumericScore);
