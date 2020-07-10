import '@brightspace-ui-labs/grade-result/d2l-grade-result.js';
import './consistent-evaluation-right-panel-block';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { html, LitElement } from 'lit-element';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

export class ConsistentEvaluationGradeResult extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			grade: { type: Object },
			customManualOverrideText: { type: String },
			customManualOverrideClearText: { type: String },
			_labelText: { type: String },
			_readOnly: { type: Boolean },
			_hideTitle: { type: Boolean },

			_manuallyOverriddenGrade: { type: Object },
			_hasUnsavedChanged: { type: Boolean },
			_includeGradeButton: { type: Boolean },
			_includeReportsButton: { type: Boolean },
			_gradeButtonTooltip: { type: String },
			_reportsButtonTooltip: { type: String },
			_isGradeAutoCompleted: { type: Boolean },
		};
	}

	constructor() {
		super();
		this.grade = new Grade(GradeType.Number, 0, 0, null, null, null);
		this.customManualOverrideText = undefined;
		this.customManualOverrideClearText = undefined;
		this._readOnly = false;
		this._labelText = '';
		this._hideTitle = false;
		// hard coded as disabled as not yet supported by API
		this._manuallyOverriddenGrade = undefined;
		this._hasUnsavedChanged = false;
		this._includeGradeButton = false;
		this._includeReportsButton = false;
		this._gradeButtonTooltip = undefined;
		this._reportsButtonTooltip = undefined;
		this._isGradeAutoCompleted = false;
	}

	onGradeChanged(e) {
		const score = e.detail.value;
		this.grade.setScore(score);
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-grade-changed', {
			composed: true,
			bubbles: true,
			detail: {
				grade: this.grade
			}
		}));
	}

	render() {
		const gradeType = this.grade.getScoreType();
		let score = this.grade.getScore();
		const scoreOutOf = this.grade.getScoreOutOf();

		// handle when grade is not yet initialized on the server
		if (gradeType === GradeType.Number && score === null) {
			score = 0;
		} else if (gradeType === GradeType.Letter && score === null) {
			score = '';
		}
		return html`
			<d2l-consistent-evaluation-right-panel-block title="Overall Grade">
			<d2l-labs-d2l-grade-result-presentational
				labelText=${this.localize('overallGrade')}
				.gradeType=${gradeType}
				scoreNumerator=${score}
				scoreDenominator=${scoreOutOf}
				.letterGradeOptions=${scoreOutOf}
				selectedLetterGrade=${score}
				.customManualOverrideText=${this.customManualOverrideText}
				.customManualOverrideClearText=${this.customManualOverrideClearText}

				gradeButtonTooltip=${this._gradeButtonTooltip}
				reportsButtonTooltip=${this._reportsButtonTooltip}
				?includeGradeButton=${this._includeGradeButton}
				?includeReportsButton=${this._includeReportsButton}

				?isGradeAutoCompleted=${this._isGradeAutoCompleted}
				?isManualOverrideActive=${this._manuallyOverriddenGrade !== undefined}

				?readOnly=${this._readOnly}
				?hideTitle=${this._hideTitle}

				@d2l-grade-result-grade-change=${this.onGradeChanged}
				@d2l-grade-result-letter-score-selected=${this.onGradeChanged}
				@d2l-grade-result-manual-override-click=${this._handleManualOverrideClick}
				@d2l-grade-result-manual-override-clear-click=${this._handleManualOverrideClearClick}
			></d2l-labs-d2l-grade-result-presentational>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}
customElements.define('d2l-consistent-evaluation-grade-result', ConsistentEvaluationGradeResult);
