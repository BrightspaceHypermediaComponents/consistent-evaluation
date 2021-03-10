import '@brightspace-ui-labs/grade-result/d2l-grade-result.js';
import './consistent-evaluation-right-panel-block';
import { css, html, LitElement } from 'lit-element';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { appId } from '../controllers/constants.js';
import { createClient } from '@brightspace-ui/logging';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

export class ConsistentEvaluationGradeResult extends SkeletonMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get properties() {
		return {
			grade: {
				attribute: false,
				type: Object
			},
			gradeItemInfo: {
				attribute: false,
				type: Object
			},
			customManualOverrideText: {
				attribute: 'custom-manual-override-text',
				type: String
			},
			customManualOverrideClearText: {
				attribute:'custom-manual-override-clear-text',
				type: String
			},
			readOnly: {
				attribute: 'read-only',
				type: Boolean
			},
			hideTitle: {
				attribute: 'hide-title',
				type: Boolean
			},
			_manuallyOverriddenGrade: { type: Object },
			_hasUnsavedChanged: { type: Boolean },
			_gradeButtonTooltip: { type: String },
			_reportsButtonTooltip: { type: String },
			_isGradeAutoCompleted: { type: Boolean },
			_gradeSummaryInfo: { type: String }
		};
	}

	static get styles() {
		return [super.styles, css`
			:host([skeleton]) .d2l-skeleton-grade-title {
				height: 0.5rem;
				margin-top: 1.5rem;
				width: 4rem;
			}
			:host([skeleton]) .d2l-skeleton-grade-presentation {
				height: 0.5rem;
				margin-top: 1.5rem;
				width: 8rem;
			}
			:host([skeleton]) .d2l-consistent-evaluation-grade-result-block {
				display: none;
			}

			@media (max-width: 767px) {
				:host([skeleton]) .d2l-skeleton-consistent-evaluation-right-panel-block {
					display: none;
				}
			}
		`];
	}

	constructor() {
		super();
		this.grade = new Grade(GradeType.Number, 0, 0, null, null, null);
		this.gradeItemInfo = {};
		this.customManualOverrideText = undefined;
		this.customManualOverrideClearText = undefined;
		this.readOnly = false;
		this.hideTitle = false;
		this._gradeButtonUrl = '';
		this._reportsButtonUrl = '';
		this._debounceJobs = {};
		this.flush = this.flush.bind(this);

		// hard coded as disabled as not yet supported by API
		this._manuallyOverriddenGrade = undefined;
		this._hasUnsavedChanged = false;
		this._gradeButtonTooltip = undefined;
		this._reportsButtonTooltip = undefined;
		this._isGradeAutoCompleted = false;
		this.logger = createClient(appId);
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('d2l-flush', this.flush);
	}

	disconnectedCallback() {
		window.removeEventListener('d2l-flush', this.flush);
		super.disconnectedCallback();
	}

	flush() {
		if (this._debounceJobs.grade && this._debounceJobs.grade.isActive()) {
			this._debounceJobs.grade.flush();
		}
	}

	onGradeChanged(e) {
		const score = e.detail.value;
		this._debounceJobs.grade = Debouncer.debounce(
			this._debounceJobs.grade,
			timeOut.after(800),
			() => this._emitGradeChangeEvent(score)
		);
	}

	_emitGradeChangeEvent(score) {
		this.grade.setScore(score);
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-grade-changed', {
			composed: true,
			bubbles: true,
			detail: {
				grade: this.grade
			}
		}));
	}

	_setGradeSummaryInfo(gradeType, score, scoreOutOf) {
		let summary = '';
		if (score === null || score === '') {
			summary = this.localize('noGradeSummary');
		} else if (gradeType === GradeType.Letter) {
			summary = score;
		} else {
			summary = this.localize('gradeSummary', { grade: score, outOf: scoreOutOf });
		}
		this._gradeSummaryInfo = summary;
	}

	_renderSkeleton() {
		return html `
			<div class="d2l-skeleton-consistent-evaluation-right-panel-block" aria-hidden="${!this.skeleton}" aria-busy="${this.skeleton}">
				<div class="d2l-skeleton-grade-title d2l-skeletize"></div>
				<div class="d2l-skeleton-grade-presentation d2l-skeletize"></div>
			</div>`;
	}

	render() {
		const gradeType = this.grade.getScoreType();
		let score = this.grade.getScore();
		const scoreOutOf = this.grade.getScoreOutOf();

		// handle when grade is not yet initialized on the server
		if (gradeType === GradeType.Letter && score === null) {
			score = '';
		}
		this._setGradeSummaryInfo(gradeType, score, scoreOutOf);

		return html`
			${this._renderSkeleton()}
			<d2l-consistent-evaluation-right-panel-block
				class="d2l-consistent-evaluation-grade-result-block"
				aria-hidden="${this.skeleton}"
				supportingInfo=${ifDefined(this._gradeSummaryInfo)}
				title="${this.localize('overallGrade')}">
					<d2l-labs-d2l-grade-result-presentational
						.gradeType=${gradeType}
						scoreNumerator=${score}
						scoreDenominator=${scoreOutOf}
						.letterGradeOptions=${scoreOutOf}
						selectedLetterGrade=${score}
						.customManualOverrideText=${this.customManualOverrideText}
						.customManualOverrideClearText=${this.customManualOverrideClearText}

						gradeButtonTooltip=${this.localize('attachedGradeItem', 'gradeItemName', this.gradeItemInfo && this.gradeItemInfo.gradeItemName)}
						reportsButtonTooltip=${this.localize('statistics')}
						?includeGradeButton=${this.gradeItemInfo && this.gradeItemInfo.evaluationUrl}
						?includeReportsButton=${this.gradeItemInfo && this.gradeItemInfo.statsUrl}

						?isGradeAutoCompleted=${this._isGradeAutoCompleted}
						?isManualOverrideActive=${this._manuallyOverriddenGrade !== undefined}

						?readOnly=${this.readOnly}
						?hideTitle=${this.hideTitle}

						@d2l-grade-result-reports-button-click=${this._openGradeStatisticsDialog}
						@d2l-grade-result-grade-button-click=${this._openGradeEvaluationDialog}
						@d2l-grade-result-grade-change=${this.onGradeChanged}
						@d2l-grade-result-letter-score-selected=${this.onGradeChanged}
						@d2l-grade-result-manual-override-click=${this._handleManualOverrideClick}
						@d2l-grade-result-manual-override-clear-click=${this._handleManualOverrideClearClick}
					></d2l-labs-d2l-grade-result-presentational>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}

	_openGradeEvaluationDialog() {

		const dialogUrl = this.gradeItemInfo && this.gradeItemInfo.evaluationUrl;

		if (!dialogUrl) {
			this.logger.log('Consistent-Eval: Expected grade item evalutaion dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(dialogUrl);

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
			/*               opener: */ document.body,
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

	_openGradeStatisticsDialog() {

		const dialogUrl = this.gradeItemInfo && this.gradeItemInfo.statsUrl;

		if (!dialogUrl) {
			this.logger.log('Consistent-Eval: Expected grade item statistics dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(dialogUrl);

		const buttons = [
			{
				Key: 'close',
				Text: this.localize('closeBtn'),
				ResponseType: 1, // D2L.Dialog.ResponseType.Positive
				IsPrimary: true,
				IsEnabled: true
			}
		];

		D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
			/*               opener: */ document.body,
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

}
customElements.define('d2l-consistent-evaluation-grade-result', ConsistentEvaluationGradeResult);
