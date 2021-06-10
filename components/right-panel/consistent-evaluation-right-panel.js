import './consistent-evaluation-feedback-presentational.js';
import './consistent-evaluation-outcomes.js';
import './consistent-evaluation-rubric.js';
import './consistent-evaluation-grade-result.js';
import './consistent-evaluation-coa-eval-override.js';
import './consistent-evaluation-right-panel-skeleton.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import { css, html, LitElement } from 'lit-element';
import { getRubricAssessmentScore, mapRubricScoreToGrade } from '../helpers/rubricGradeSyncHelpers.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationRightPanel extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {

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
			canSaveOverallGrade: {
				attribute: 'can-save-overall-grade',
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
			useNewHtmlEditor: {
				attribute: 'use-new-html-editor',
				type: Boolean
			},
			useInlineGradingRevamp: {
				attribute: 'use-inline-grading-revamp',
				type: Boolean
			},
			discussionCalulationType: {
				attribute: 'discussion-calculation-type',
				type: String
			},
			specialAccessHref: {
				attribute: 'special-access-href',
				type: String
			},
			_specialAccessId: {
				attribute: false,
				type: String
			},
			editActivityPath: {
				attribute: 'edit-activity-path',
				type: String
			},
			_editActivityId: {
				attribute: false,
				type: String
			},
			outcomeTerm: {
				attribute: 'outcome-term',
				type: String
			},
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			}
		};
	}

	static get styles() {
		return  [super.styles, css`
			.d2l-consistent-evaluation-right-panel-overflow-menu-mobile {
				display: none;
			}

			.d2l-consistent-evaluation-right-panel {
				margin: 1.5rem 1.2rem 2rem 1.2rem;
				position: relative;
			}

			.d2l-consistent-evaluation-right-panel-clearfix::after {
				clear: both;
				content: "";
				display: table;
			}

			@media (max-width: 767px) {
				.d2l-consistent-evaluation-right-panel {
					margin: 0;
				}

				.d2l-consistent-evaluation-right-panel-overflow-menu-mobile {
					display: inline-block;
					margin: 0.5rem 1.25rem 0.5rem 1.25rem;
				}

				.d2l-consistent-evaluation-right-panel-clearfix {
					display: none;
				}
			}

			.d2l-consistent-evaluation-right-panel-overflow-menu {
				float: right;
				margin-bottom: -0.25rem;
				margin-top: -0.5rem;
			}

			:host([skeleton]) d2l-consistent-evaluation-rubric {
				display: none;
			}

			:host([skeleton]) d2l-consistent-evaluation-grade-result {
				display: none;
			}

			:host([skeleton]) d2l-consistent-evaluation-feedback-presentational {
				display: none;
			}

			:host([skeleton]) d2l-consistent-evaluation-outcomes {
				display: none;
			}

			:host([skeleton]) .d2l-consistent-evaluation-right-panel-clearfix {
				display: none;
			}

			:host([skeleton]) d2l-consistent-evaluation-coa-eval-override {
				display: none;
			}
		`];
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
		this.canSaveOverallGrade = false;
		this.useNewHtmlEditor = false;
		this._specialAccessId = getUniqueId();
		this._editActivityId = getUniqueId();
		this.rubricsOpen = 0;
	}

	render() {
		return html`
			<div class="d2l-consistent-evaluation-right-panel">
				${this._renderSkeleton()}
				${this._renderOverflowButtonIcon()}
				${this._renderRubric()}
				${this._renderGrade()}
				${this._renderCoaOverride()}
				${this._renderFeedback()}
				${this._renderOutcome()}
				${this._renderOverflowButtonMobile()}
			</div>
		`;
	}
	_onOverflowOptionSelect(e) {
		switch (e.target.id) {
			case this._specialAccessId:
				this._openSpecialAccessDialog();
				break;
			case this._editActivityId:
				this._openEditActivity();
				break;
		}
	}
	_openEditActivity() {
		window.open(this.editActivityPath);
	}
	_openSpecialAccessDialog() {
		const specialAccess = this.specialAccessHref;

		if (!specialAccess) {
			this.logger.log('Consistent-Eval: Expected special access item dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(specialAccess);

		const buttons = [
			{
				Key: 'save',
				Text: this.localize('saveBtn'),
				ResponseType: 1, // D2L.Dialog.ResponseType.Positive
				IsPrimary: true,
				IsEnabled: true
			},
			{
				Text: this.localize('cancelBtn'),
				ResponseType: 2, // D2L.Dialog.ResponseType.Negative
				IsPrimary: false,
				IsEnabled: true
			}
		];

		D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
			/*               opener: */ this.shadowRoot.querySelector('d2l-dropdown-more'),
			/*             location: */ location,
			/*          srcCallback: */ 'SrcCallback',
			/*       resizeCallback: */ '',
			/*      responseDataKey: */ 'result',
			/*                width: */ 1920,
			/*               height: */ 1080,
			/*            closeText: */ this.localize('closeBtn'),
			/*              buttons: */ buttons,
			/* forceTriggerOnCancel: */ false
		);
	}
	_renderCoaOverride() {
		if (!this.hideCoaOverride) {
			return html`
				<d2l-consistent-evaluation-coa-eval-override
					aria-hidden="${this.skeleton}"
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
					aria-hidden="${this.skeleton}"
					.href=${this.evaluationHref}
					.token=${this.token}
					?can-edit-feedback=${this.allowEvaluationWrite}
					?can-add-file=${this.canAddFeedbackFile}
					?can-record-video=${this.canRecordFeedbackVideo}
					?can-record-audio=${this.canRecordFeedbackAudio}
					?use-new-html-editor=${this.useNewHtmlEditor}
					.feedbackText=${this.feedbackText}
					.attachments=${this.feedbackAttachments}
					.richTextEditorConfig=${this.richTextEditorConfig}
				></d2l-consistent-evaluation-feedback-presentational>
			`;
		}

		return html``;
	}
	_renderGrade() {
		if (!this.hideGrade) {
			return html`
				<d2l-consistent-evaluation-grade-result
					aria-hidden="${this.skeleton}"
					discussion-calculation-type=${this.discussionCalulationType}
					.grade=${this.grade}
					.gradeItemInfo=${this.gradeItemInfo}
					?read-only=${!this.allowEvaluationWrite || this.discussionCalulationType}
				></d2l-consistent-evaluation-grade-result>
			`;
		}

		return html``;
	}

	_renderOutcome() {
		if (!this.hideOutcomes) {
			return html`
				<d2l-consistent-evaluation-outcomes
					aria-hidden="${this.skeleton}"
					outcome-term="${this.outcomeTerm}"
					href=${this.outcomesHref}
					.token=${this.token}
				></d2l-consistent-evaluation-outcomes>
			`;
		}

		return html``;
	}
	_renderOverflowButtonIcon() {
		if (!this.editActivityPath && !this.specialAccessHref) {
			return html``;
		}
		return html`
			<div class="d2l-consistent-evaluation-right-panel-clearfix"
				aria-hidden="${this.skeleton}">
				<d2l-dropdown-more class="d2l-consistent-evaluation-right-panel-overflow-menu" text=${this.localize('evaluationOptions')}>
					${this._renderOverflowMenu()}
				</d2l-dropdown-more>
			</div>
		`;
	}
	_renderOverflowButtonMobile() {
		if (!this.editActivityPath && !this.specialAccessHref) {
			return html``;
		}
		return html`
			<d2l-dropdown-button-subtle class="d2l-consistent-evaluation-right-panel-overflow-menu-mobile" text=${this.localize('evaluationOptions')}>
				${this._renderOverflowMenu()}
			</d2l-dropdown-button-subtle>
		`;
	}
	_renderOverflowMenu() {
		return html`
			<d2l-dropdown-menu>
				<d2l-menu @d2l-menu-item-select=${this._onOverflowOptionSelect} label=${this.localize('evaluationOptions')}>
					<d2l-menu-item id=${this._editActivityId} text=${this.localize('editActivity')} ?hidden=${!this.editActivityPath}></d2l-menu-item>
					<d2l-menu-item id=${this._specialAccessId} text=${this.localize('specialAccessDates')} ?hidden=${!this.specialAccessHref}></d2l-menu-item>
				</d2l-menu>
			</d2l-dropdown-menu>
		`;
	}
	_renderRubric() {
		if (this.rubricInfos && this.rubricInfos.length > 0) {
			const showActiveScoringRubric = (this.grade.getScoreOutOf() && this.activeScoringRubric);
			return html`
				<d2l-consistent-evaluation-rubric
					aria-hidden="${this.skeleton}"
					header=${this.localize('rubrics')}
					.rubricInfos=${this.rubricInfos}
					active-scoring-rubric=${this.activeScoringRubric}
					rubric-popout-location=${this.rubricPopoutLocation}
					.token=${this.token}
					?show-active-scoring-rubric-options=${showActiveScoringRubric}
					?read-only=${this.rubricReadOnly}
					?can-save-overall-grade=${this.canSaveOverallGrade}
					?use-inline-grading-revamp=${this.useInlineGradingRevamp}
					@d2l-consistent-eval-rubric-total-score-changed=${this._syncGradeToRubricScore}
					@d2l-consistent-eval-active-scoring-rubric-change=${this._updateScoreWithActiveScoringRubric}
					@d2l-rubric-compact-expanded-changed=${this._updateRubricOpenState}
				></d2l-consistent-evaluation-rubric>
			`;
		}

		return html``;
	}

	_renderSkeleton() {
		return html`
			<consistent-evaluation-right-panel-skeleton
				?skeleton=${this.skeleton}
			></consistent-evaluation-right-panel-skeleton>`;
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
	_updateGrade(newScore, rubricInfo) {

		const newGrade = mapRubricScoreToGrade(
			rubricInfo,
			this.grade,
			newScore
		);

		if (newGrade.score === this.grade.score && newGrade.scoreType === GradeType.Number) {
			return;
		}

		if (newGrade.letterGrade === this.grade.letterGrade && newGrade.scoreType === GradeType.Letter) {
			return;
		}

		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-grade-changed', {
			composed: true,
			bubbles: true,
			detail: {
				isValidGrade: true,
				grade: newGrade
			}
		}));
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

}

customElements.define('consistent-evaluation-right-panel', ConsistentEvaluationRightPanel);
