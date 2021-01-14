import './consistent-evaluation-feedback-presentational.js';
import './consistent-evaluation-outcomes.js';
import './consistent-evaluation-rubric.js';
import './consistent-evaluation-grade-result.js';
import './consistent-evaluation-coa-eval-override.js';
import { css, html, LitElement } from 'lit-element';
import { getRubricAssessmentScore, mapRubricScoreToGrade} from '../helpers/rubricGradeSyncHelpers.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationRightPanel extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			allowEvaluationWrite: {
				attribute: 'allow-evaluation-write',
				type: Boolean
			},
			canAddFeedbackFile: {
				attribute: 'allow-add-file',
				type: Boolean
			},
			canRecordFeedbackVideo: {
				attribute: 'allow-record-video',
				type: Boolean
			},
			canRecordFeedbackAudio: {
				attribute: 'allow-record-audio',
				type: Boolean
			},
			feedbackText: {
				attribute: false
			},
			feedbackAttachments: {
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
			richtextEditorConfig: {
				attribute: false,
				type: Object
			},
			rubricInfos: {
				attribute: false,
				type: Array
			},
			activeScoringRubric: {
				attribute: 'active-scoring-rubric',
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
			rubricPopoutLocation: {
				attribute: 'rubric-popout-location',
				type: String
			},
			token: {
				type: Object,
				converter: {
					formatAttribute(value) {
						const retVal = String(value);
						return retVal;
					},
					toAttribute(value) {
						const retVal = Object(value);
						return retVal;
					}
				}
			}
		};
	}

	static get styles() {
		return  css`
			.d2l-consistent-evaluation-right-panel {
				margin: 1.5rem 1.2rem 0 1.2rem;
			}

			@media (max-width: 767px) {
				.d2l-consistent-evaluation-right-panel {
					margin: 0;
				}
			}
		`;
	}

	constructor() {
		super();

		this._token = undefined;
		this.hideGrade = false;
		this.hideFeedback = false;
		this.hideOutcomes = false;
		this.hideCoaOverride = false;
		this.allowEvaluationWrite = false;
		this.canAddFeedbackFile = false;
		this.canRecordFeedbackVideo = false;
		this.canRecordFeedbackAudio = false;
		this.rubricsOpen = 0;
	}

	_renderRubric() {
		if (this.rubricInfos && this.rubricInfos.length > 0) {
			const showActiveScoringRubric = (this.grade.getScoreOutOf() && this.activeScoringRubric);
			return html`
				<d2l-consistent-evaluation-rubric
					header=${this.localize('rubrics')}
					.rubricInfos=${this.rubricInfos}
					active-scoring-rubric=${this.activeScoringRubric}
					rubric-popout-location=${this.rubricPopoutLocation}
					.token=${this.token}
					?show-active-scoring-rubric-options=${showActiveScoringRubric}
					?read-only=${this.rubricReadOnly}
					@d2l-consistent-eval-rubric-total-score-changed=${this._syncGradeToRubricScore}
					@d2l-consistent-eval-active-scoring-rubric-change=${this._updateScoreWithActiveScoringRubric}
					@d2l-rubric-compact-expanded-changed=${this._updateRubricOpenState}
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
					?can-add-file=${this.canAddFeedbackFile}
					?can-record-video=${this.canRecordFeedbackVideo}
					?can-record-audio=${this.canRecordFeedbackAudio}
					.feedbackText=${this.feedbackText}
					.attachments=${this.feedbackAttachments}
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
			<div class="d2l-consistent-evaluation-right-panel">
				${this._renderRubric()}
				${this._renderGrade()}
				${this._renderCoaOverride()}
				${this._renderFeedback()}
				${this._renderOutcome()}
			</div>
		`;
	}

	_updateRubricOpenState(e) {
		if (e.detail) {
			if (e.detail.expanded) {
				this.rubricsOpen++;
			} else if (this.rubricsOpen > 0) {
				this.rubricsOpen--;
			}
		}
	}

	_syncGradeToRubricScore(e) {
		if (!this.allowEvaluationWrite) {
			return;
		}

		if (!e.detail.bypassRubricState && this.rubricsOpen === 0) {
			return;
		}

		this._updateGrade(
			e.detail.score,
			e.detail.rubricInfo
		);
	}

	async _updateScoreWithActiveScoringRubric(e) {
		const newRubricId = e.detail.rubricId;
		const currentRubricInfo = this.rubricInfos.find(rubric => rubric.rubricId === newRubricId);
		if (!currentRubricInfo) {
			// user selected "no grading rubric"
			return;
		}
		const newScore = await getRubricAssessmentScore(currentRubricInfo, this.token);

		this._updateGrade(
			newScore,
			currentRubricInfo
		);
	}

	_updateGrade(newScore, rubricInfo) {

		const newGrade = mapRubricScoreToGrade(
			rubricInfo,
			this.grade,
			newScore
		);

		if (newGrade.score === this.grade.score) {
			return;
		}

		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-grade-changed', {
			composed: true,
			bubbles: true,
			detail: {
				grade: newGrade
			}
		}));
	}
}

customElements.define('consistent-evaluation-right-panel', ConsistentEvaluationRightPanel);
