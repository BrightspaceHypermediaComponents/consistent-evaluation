import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui/core/components/button/button-icon.js';
import 'd2l-tooltip/d2l-tooltip.js';
import { bodyStandardStyles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';

export class D2LGradeResultPresentational extends LitElement {
	static get properties() {
		return {
			labelText: { type: String },
			scoreDenominator: { type: Number },
			scoreNumerator: { type: Number },
			gradeButtonTooltip: { type: String },
			reportsButtonTooltip: { type: String }
		};
	}

	static get styles() {
		return [bodyStandardStyles, labelStyles, inputLabelStyles, css`
			.d2l-grade-result-presentational-container {
				display: flex;
				flex-direction: row;
				align-items: center;
			}
			.d2l-grade-result-presentational-score {
				max-width: 5.25rem;
			}
			.d2l-grade-result-presentational-score-text {
				width: 2.8rem;
				text-align: center;
			}
		`];
	}

	render() {
		return html`
			<span class="d2l-input-label">
				${this.labelText ? html`${this.labelText}` : html` `}
			</span>
			<div class="d2l-grade-result-presentational-container">
				
				<div class="d2l-grade-result-presentational-score">
					<d2l-input-text
						type="number"
						value="${this.scoreNumerator}"
						min="0"
						@change=${this._onGradeChange}
			 		></d2l-input-text>
				</div>

				<div class="d2l-grade-result-presentational-score-text">
					${this.scoreDenominator ? html`
						<div class="d2l-body-standard">/ ${this.scoreDenominator}</div>
					` : html``}
				</div>
				
				<div>
					<d2l-button-icon
						id="d2l-grade-result-presentational-grade-button"
						icon="tier1:grade"
						@click=${this._onGradeButtonClick}
					></d2l-button-icon>
					
					${this.gradeButtonTooltip ? html`
						<d2l-tooltip
							for="d2l-grade-result-presentational-grade-button"
							position="top"
						>
							${this.gradeButtonTooltip}
						</d2l-tooltip>
					` : html`` }
				</div>
				
				<div>
					<d2l-button-icon
						id="d2l-grade-result-presentational-reports-button"
						icon="tier1:reports" 
						@click=${this._onReportsButtonClick}
					></d2l-button-icon>
					
					${this.reportsButtonTooltip ? html`
						<d2l-tooltip
							for="d2l-grade-result-presentational-reports-button"
							position="top"
						>
							${this.reportsButtonTooltip}
						</d2l-tooltip>
					` : html``}
				</div>

			</div>
		`;
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

	_onGradeButtonClick() {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-grade-button-click', {
			bubbles: true,
			composed: true,
		}));
	}

	_onReportsButtonClick() {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-reports-button-click', {
			bubbles: true,
			composed: true,
		}));
	}
}

customElements.define('d2l-grade-result-presentational', D2LGradeResultPresentational);
