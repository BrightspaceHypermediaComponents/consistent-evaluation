import './consistent-evaluation-feedback-presentational.js';
import './consistent-evaluation-outcomes.js';
import './consistent-evaluation-rubric.js';
import './consistent-evaluation-grade-result.js';
import './consistent-evaluation-coa-eval-override.js';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { html, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

export class ConsistentEvaluationRightPanel extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			allowEvaluationWrite: {
				attribute: 'allow-evaluation-write',
				type: Boolean
			},
			feedbackText: {
				attribute: false
			},
			grade: {
				attribute: false,
				type: Object
			},
			gradeItemInfo: {
				attribute: false,
				type: Object
			},
			hideRubric: {
				attribute: 'hide-rubric',
				type: Boolean
			},
			hideGrade: {
				attribute: 'hide-grade',
				type: Boolean
			},
			hideCoaOverride: {
				attribute: 'hide-coa-eval-override',
				type: Boolean
			},
			hideFeedback: {
				attribute: 'hide-feedback',
				type: Boolean
			},
			hideOutcomes: {
				attribute: 'hide-outcomes',
				type: Boolean
			},
			outcomesHref: {
				attribute: 'outcomes-href',
				type: String
			},
			richTextEditorDisabled: {
				attribute: 'rich-text-editor-disabled',
				type: Boolean
			},
			richtextEditorConfig: {
				attribute: false,
				type: Object
			},
			rubricAssessmentHref: {
				attribute: 'rubric-assessment-href',
				type: String
			},
			rubricHref: {
				attribute: 'rubric-href',
				type: String
			},
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			coaOverrideHref: {
				attribute: 'coa-eval-override-href',
				type: String
			},
			rubricReadOnly: {
				attribute: 'rubric-read-only',
				type: Boolean
			},
			token: {
				type: Object
			}
		};
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();

		this._token = undefined;
		this.hideRubric = false;
		this.hideGrade = false;
		this.hideFeedback = false;
		this.hideOutcomes = false;
		this.hideCoaOverride = false;
		this.rubricFirstLoad = true;
		this.allowEvaluationWrite = false;
	}

	_renderRubric() {
		if (!this.hideRubric) {
			return html`
				<d2l-consistent-evaluation-rubric
					header=${this.localize('rubrics')}
					href=${this.rubricHref}
					assessment-href=${ifDefined(this.rubricAssessmentHref)}
					.token=${this.token}
					?read-only=${this.rubricReadOnly}
					@d2l-rubric-total-score-changed=${this._syncRubricGrade}
				></d2l-consistent-evaluation-rubric>
			`;
		}

		return html``;
	}

	_renderGrade() {
		if (!this.hideGrade) {
			return html`
				<d2l-consistent-evaluation-grade-result
					.grade=${this.grade}
					.gradeItemInfo=${this.gradeItemInfo}
					?read-only=${!this.allowEvaluationWrite}
				></d2l-consistent-evaluation-grade-result>
			`;
		}

		return html``;
	}

	_renderCoaOverride() {
		if (!this.hideCoaOverride) {
			return html`
				<d2l-consistent-evaluation-coa-eval-override
					href=${this.coaOverrideHref}
					.token=${this.token}
				></d2l-consistent-evaluation-coa-eval-override>
			`;
		}
	}

	_renderFeedback() {
		if (!this.hideFeedback) {
			return html`
				<d2l-consistent-evaluation-feedback-presentational
					.href=${this.evaluationHref}
					.token=${this.token}
					?can-edit-feedback=${this.allowEvaluationWrite}
					.feedbackText=${this.feedbackText}
					.richTextEditorConfig=${this.richTextEditorConfig}
				></d2l-consistent-evaluation-feedback-presentational>
			`;
		}

		return html``;

	}

	_renderOutcome() {
		if (!this.hideOutcomes) {
			return html`
				<d2l-consistent-evaluation-outcomes
					header=${this.localize('outcomes')}
					href=${this.outcomesHref}
					.token=${this.token}
				></d2l-consistent-evaluation-outcomes>
			`;
		}

		return html``;
	}

	render() {
		return html`
			${this._renderRubric()}
			${this._renderGrade()}
			${this._renderCoaOverride()}
			${this._renderFeedback()}
			${this._renderOutcome()}
		`;
	}

	_syncRubricGrade(e) {
		if (e.detail.score === null || !this.allowEvaluationWrite) {
			return;
		}

		if (this.rubricFirstLoad) {
			this.rubricFirstLoad = false;
			return;
		}

		let score = this.grade.score;
		let letterGrade = this.grade.letterGrade;
		let outOf = 100;
		if (e.detail.outOf) {
			outOf = e.detail.outOf;
		}

		if (this.grade.scoreType === GradeType.Letter && this.grade.entity.properties.letterGradeSchemeRanges) {
			const percentage = (e.detail.score / outOf) * 100;
			const map = this.grade.entity.properties.letterGradeSchemeRanges;
			for (const [key, value] of Object.entries(map)) {
				if (percentage >= value) {
					letterGrade = key;
					break;
				}
			}
		} else {
			score = (e.detail.score / outOf) * this.grade.outOf;
		}

		this.grade = new Grade(
			this.grade.scoreType,
			score,
			this.grade.outOf,
			letterGrade,
			this.grade.letterGradeOptions,
			this.grade.entity
		);

		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-grade-changed', {
			composed: true,
			bubbles: true,
			detail: {
				grade: this.grade
			}
		}));
	}
}

customElements.define('consistent-evaluation-right-panel', ConsistentEvaluationRightPanel);
