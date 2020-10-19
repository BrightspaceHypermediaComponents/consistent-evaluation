import '@brightspace-ui-labs/grade-result/d2l-grade-result.js';
import './consistent-evaluation-right-panel-block';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { html, LitElement } from 'lit-element';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

export class ConsistentEvaluationGradeResult extends LocalizeMixin(LitElement) {

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
			labelText: {
				attribute: 'label-text',
				type: String },
			readOnly: {
				attribute: 'read-only',
				type: Boolean },
			hideTitle: {
				attribute: 'hide-title',
				type: Boolean },

			_manuallyOverriddenGrade: { type: Object },
			_hasUnsavedChanged: { type: Boolean },
			_gradeButtonTooltip: { type: String },
			_reportsButtonTooltip: { type: String },
			_isGradeAutoCompleted: { type: Boolean }
		};
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();
		this.grade = new Grade(GradeType.Number, 0, 0, null, null, null);
		this.gradeItemInfo = {};
		this.customManualOverrideText = undefined;
		this.customManualOverrideClearText = undefined;
		this.readOnly = false;
		this.labelText = '';
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
				labelText=${this.labelText || this.localize('overallGrade')}
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
			console.error('Consistent-Eval: Expected grade item evalutaion dialog URL, but none found');
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
			console.error('Consistent-Eval: Expected grade item statistics dialog URL, but none found');
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
