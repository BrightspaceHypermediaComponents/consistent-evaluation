import './d2l-grade-result-icon-button.js';
import './d2l-grade-result-numeric-score.js';
import './d2l-grade-result-letter-score.js';
import { css, html, LitElement } from 'lit-element';

// is grade autocalculated -> show manually override option -> clear manual override -> dialogue
// gradeType -> ['letter', 'number'] -> on letter change to select box

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
			includeGradeButton: { type: Boolean },
			includeReportsButton: { type: Boolean },
			gradeButtonTooltip: { type: String },
			reportsButtonTooltip: { type: String },
			doesUserHavePermissionToEvaluation: { type: Boolean },
		};
	}

	static get styles() {
		return css`
			#d2l-grade-result-presentational-container {
				display: flex;
				flex-direction: row;
				align-items: center;
			}
		`;
	}

	constructor() {
		super();
		this.doesUserHavePermissionToEvaluation = false;
		this.includeGradeButton = false;
		this.includeReportsButton = false;
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

	getNumericScoreComponent() {
		return html`
			<d2l-grade-result-numeric-score
				scoreNumerator=${this.scoreNumerator}
				scoreDenominator=${this.scoreDenominator}
				.doesUserHavePermissionToEvaluation=${this.doesUserHavePermissionToEvaluation}
			></d2l-grade-result-numeric-score>
		`;
	}

	getLetterScoreComponent() {
		return html`
			<d2l-grade-result-letter-score
			></d2l-grade-result-letter-score>
		`;
	}

	getScoreComponent() {
		if (this.gradeType === GradeType.Number) {
			return this.getNumericScoreComponent();
		} else if (this.gradeType === GradeType.Letter) {
			return this.getLetterScoreComponent();
		} else {
			throw 'INVALID GRADE TYPE PROVIDED';
		}
	}

	render() {
		return html`
			<span class="d2l-input-label">
				${this.labelText ? html`${this.labelText}` : html``}
			</span>

			<div id="d2l-grade-result-presentational-container">

				${this.getScoreComponent()}

				${this.includeGradeButton ?  html`
					<d2l-grade-result-icon-button
						.tooltipText="${this.gradeButtonTooltip}"
						icon="tier1:grade"
						_id="1"
						@d2l-grade-result-icon-button-click=${this._onGradeButtonClick}
					></d2l-grade-result-icon-button>
				` : html``}
				
				${this.includeReportsButton ? html`
					<d2l-grade-result-icon-button
						.tooltipText="${this.reportsButtonTooltip}"
						icon="tier1:reports"
						_id="2"
						@d2l-grade-result-icon-button-click=${this._onReportsButtonClick}
					></d2l-grade-result-icon-button>
				` : html``}

			</div>
		`;
	}
}

customElements.define('d2l-grade-result-presentational', D2LGradeResultPresentational);
