import './d2l-grade-result-presentational.js';
import { html, LitElement } from 'lit-element';
// eslint-disable-next-line no-duplicate-imports
import { GradeType } from './d2l-grade-result-presentational.js';

export class D2LGradeResult extends LitElement {
	static get properties() {
		return {
			href: { type: String },
			token: { type: String },
			_labeltext: { type: String },
			_scorenumerator: { type: String },
			_scoredenominator: { type: String },
			_gradebuttontooltip: { type: String },
			_reportsbuttontooltip: { type: String },
			_doesUserHavePermissionToEvaluation: { type: Boolean },
			_gradeType: { type: String },
			_letterGradeOptions: { type: Array },
			_selectedLetterGrade: { type: String },
			_isGradeAutoCompleted: { type: Boolean },
			_isManualOverrideActive: { type: Boolean }
		};
	}

	constructor() {
		super();

		this._gradeType = GradeType.Number;
		this._labeltext = 'Overall Grade';
		this._scorenumerator = 5;
		this._scoredenominator = 20;
		this._gradebuttontooltip = 'Assignment 1 Grade Item Attached';
		this._reportsbuttontooltip = 'Class and user statistics';
		this._doesUserHavePermissionToEvaluation = true;
		this._isGradeAutoCompleted = true;
		this._isManualOverrideActive = false;
		this._letterGradeOptions = ['A', 'B', 'C'];
		this._selectedLetterGrade = 'C';
	}

	render() {
		if (this._gradeType === GradeType.Number) {
			return html`
				<d2l-grade-result-presentational
					gradeType=${this._gradeType}
					labeltext=${this._labeltext}
					scorenumerator=${this._scorenumerator}
					scoredenominator=${this._scoredenominator}
					gradebuttontooltip=${this._gradebuttontooltip}
					reportsbuttontooltip=${this._reportsbuttontooltip}
					doesUserHavePermissionToEvaluation=${this._doesUserHavePermissionToEvaluation}
					@d2l-grade-result-grade-change=${this._handleGradeChange}
					@d2l-grade-result-grade-button-click=${this._handleGradeButtonClick}
					@d2l-grade-result-reports-button-click=${this._handleReportsButtonClick}
					@d2l-grade-result-manual-override-button-manual-override-click=${this._handleManualOverrideClick}
					@d2l-grade-result-manual-override-button-manual-override-clear-click=${this._handleManualOverrideClearClick}
				></d2l-grade-result-presentational>
			`;

		} else if (this._gradeType === GradeType.Letter) {
			return html`
				<d2l-grade-result-presentational
					gradeType=${this._gradeType}
					labeltext=${this._labeltext}
					.letterGradeOptions=${this._letterGradeOptions}
					selectedLetterGrade=${this._selectedLetterGrade}
					gradebuttontooltip=${this._gradebuttontooltip}
					reportsbuttontooltip=${this._reportsbuttontooltip}
					doesUserHavePermissionToEvaluation=${this._doesUserHavePermissionToEvaluation}
					.isGradeAutoCompleted=${this._isGradeAutoCompleted}
					.isManualOverrideActive=${this._isManualOverrideActive}
					@d2l-grade-result-grade-button-click=${this._handleGradeButtonClick}
					@d2l-grade-result-reports-button-click=${this._handleReportsButtonClick}
					@d2l-grade-result-letter-score-selected=${this._handleLetterGradeSelected}
					@d2l-grade-result-manual-override-button-manual-override-click=${this._handleManualOverrideClick}
					@d2l-grade-result-manual-override-button-manual-override-clear-click=${this._handleManualOverrideClearClick}
				></d2l-grade-result-presentational>
			`;
		}
	}

	_handleGradeChange(e) {
		console.log(e);
		this._scorenumerator = e.detail.value;
	}

	_handleGradeButtonClick(e) {
		console.log(e);
	}

	_handleReportsButtonClick(e) {
		console.log(e);
	}

	_handleLetterGradeSelected(e) {
		console.log(e);
		this._selectedLetterGrade = e.detail.option;
	}

	_handleManualOverrideClick(e) {
		console.log(e);
		this._isManualOverrideActive = true;
	}

	_handleManualOverrideClearClick(e) {
		console.log(e);
		this._isManualOverrideActive = false;
	}
}

customElements.define('d2l-grade-result', D2LGradeResult);
