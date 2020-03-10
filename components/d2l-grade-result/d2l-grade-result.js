import './d2l-grade-result-presentational.js';
import { html, LitElement } from 'lit-element';
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
			_gradeType: { type: String }
		};
	}

	constructor() {
		super();
		this._labeltext = 'Overall Grade';
		this._scorenumerator = 5;
		this._scoredenominator = 20;
		this._gradebuttontooltip = 'Assignment 1 Grade Item Attached';
		this._reportsbuttontooltip = 'Class and user statistics';
		this._doesUserHavePermissionToEvaluation = true;
		this._gradeType = GradeType.Number;
	}

	render() {
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
			></d2l-grade-result-presentational>
		`;
	}

	_handleGradeChange(e) {
		console.log(e);
	}

	_handleGradeButtonClick(e) {
		console.log(e);
	}

	_handleReportsButtonClick(e) {
		console.log(e);
	}
}

customElements.define('d2l-grade-result', D2LGradeResult);
