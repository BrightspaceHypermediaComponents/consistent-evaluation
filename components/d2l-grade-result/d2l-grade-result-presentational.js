import './d2l-grade-result-icon-button.js';
import './d2l-grade-result-numeric-score.js';
import './d2l-grade-result-letter-score.js';
import './d2l-grade-result-manual-override-button.js';
import { css, html, LitElement } from 'lit-element';

export const GradeType = {
	Letter: 'letter',
	Number: 'number'
};

export class D2LGradeResultPresentational extends LitElement {
	static get properties() {
		return {
			gradeType: { type: String },
			labelText: { type: String },
			scoreDenominator: { type: Number },
			scoreNumerator: { type: Number },
			letterGradeOptions: { type: Array },
			selectedLetterGrade: { type: String },
			includeGradeButton: { type: Boolean },
			includeReportsButton: { type: Boolean },
			gradeButtonTooltip: { type: String },
			reportsButtonTooltip: { type: String },
			readOnly: { type: Boolean },
			isGradeAutoCompleted: { type: Boolean },
			isManualOverrideActive: { type: Boolean }
		};
	}

	static get styles() {
		return css`
			.d2l-grade-result-presentational-container {
				display: flex;
				flex-direction: row;
				align-items: center;
			}
		`;
	}

	constructor() {
		super();
		this.readOnly = false;
		this.includeGradeButton = false;
		this.includeReportsButton = false;
		this.selectedLetterGrade = '';
		this.isGradeAutoCompleted = false;
		this.isManualOverrideActive = false;
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

	_getNumericScoreComponent() {
		return html`
			<d2l-grade-result-numeric-score
				.scoreNumerator=${this.scoreNumerator}
				.scoreDenominator=${this.scoreDenominator}
				?readOnly=${this.readOnly}
			></d2l-grade-result-numeric-score>
		`;
	}

	_getLetterScoreComponent() {
		return html`
			<d2l-grade-result-letter-score
				.availableOptions=${this.letterGradeOptions}
				.selectedOption=${this.selectedLetterGrade}
				?readOnly=${this.readOnly}
			></d2l-grade-result-letter-score>
		`;
	}

	_getScoreComponent() {
		if (this.gradeType === GradeType.Number) {
			return this._getNumericScoreComponent();
		} else if (this.gradeType === GradeType.Letter) {
			return this._getLetterScoreComponent();
		} else {
			throw new Error('INVALID GRADE TYPE PROVIDED');
		}
	}

	render() {
		return html`
			<span class="d2l-input-label">
				${this.labelText ? html`${this.labelText}` : html``}
			</span>

			<div class="d2l-grade-result-presentational-container">

				${this._getScoreComponent()}

				${this.includeGradeButton ?  html`
					<d2l-grade-result-icon-button
						.tooltipText=${this.gradeButtonTooltip}
						icon="tier1:grade"
						@d2l-grade-result-icon-button-click=${this._onGradeButtonClick}
					></d2l-grade-result-icon-button>
				` : html``}
				
				${this.includeReportsButton ? html`
					<d2l-grade-result-icon-button
						.tooltipText=${this.reportsButtonTooltip}
						icon="tier1:reports"
						@d2l-grade-result-icon-button-click=${this._onReportsButtonClick}
					></d2l-grade-result-icon-button>
				` : html``}

			</div>

			${this.isGradeAutoCompleted ? html`
				<d2l-grade-result-manual-override-button
					?isManualOverrideActive=${this.isManualOverrideActive}
				></d2l-grade-result-manual-override-button>
			` : html``}
		`;
	}
}

customElements.define('d2l-grade-result-presentational', D2LGradeResultPresentational);
