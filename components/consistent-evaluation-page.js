import './left-panel/consistent-evaluation-left-panel.js';
import './footer/consistent-evaluation-footer-presentational.js';
import './right-panel/consistent-evaluation-right-panel.js';
import './left-panel/consistent-evaluation-submissions-page.js';
import '@brightspace-ui/core/components/alert/alert-toast.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import '@brightspace-ui/core/templates/primary-secondary/primary-secondary.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { draftState, publishedState } from './controllers/constants.js';
import { Grade, GradeType } from '@brightspace-ui-labs/grade-result/src/controller/Grade';
import { Awaiter } from './awaiter.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { loadLocalizationResources } from './locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

export default class ConsistentEvaluationPage extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			nextStudentHref: {
				attribute: 'next-student-href',
				type: String
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
			rubricReadOnly: {
				attribute: 'rubric-read-only',
				type: Boolean
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			gradeItemInfo: {
				attribute: false,
				type: Object
			},
			token: {
				type: String
			},
			_displayToast: {
				type: Boolean
			},
			_toastMessage: {
				type: String
			},
			_feedbackText: {
				attribute: false
			},
			_grade: {
				attribute: false
			},
			_feedbackEntity: {
				attribute: false
			},
			_gradeEntity: {
				attribute: false
			},
			_scrollbarStatus: {
				attribute: false
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-consistent-evaluation-page-primary-slot {
				height: 100%;
			}
		`;
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();
		this._evaluationHref = undefined;
		this._token = undefined;

		this._controller = undefined;
		this._evaluationEntity = undefined;
		this._displayToast = false;
		this._toastMessage = '';
		this._scrollbarStatus = 'default';
		this._mutex = new Awaiter();
	}

	get evaluationEntity() {
		return this._evaluationEntity;
	}

	set evaluationEntity(entity) {
		const oldVal = this.evaluationEntity;
		if (oldVal !== entity) {
			this._evaluationEntity = entity;
			this.requestUpdate();
		}
	}

	get evaluationHref() {
		return this._evaluationHref;
	}

	set evaluationHref(val) {
		const oldVal = this.evaluationHref;
		if (oldVal !== val) {
			this._evaluationHref = val;
			if (this._evaluationHref && this._token) {
				this._initializeController().then(() => this.requestUpdate());
			}
		}
	}

	get token() {
		return this._token;
	}

	set token(val) {
		const oldVal = this.token;
		if (oldVal !== val) {
			this._token = val;
			if (this._evaluationHref && this._token) {
				this._initializeController().then(() => this.requestUpdate());
			}
		}
	}

	get _feedbackText() {
		if (this._feedbackEntity && this._feedbackEntity.properties) {
			return this._feedbackEntity.properties.text || '';
		}
		return undefined;
	}

	get _grade() {
		if (this._gradeEntity) {
			return this._controller.parseGrade(this._gradeEntity);
		}
		return new Grade(GradeType.Number, 0, 0, null, null, this._gradeEntity);
	}

	get _feedbackEntity() {
		if (this.evaluationEntity) {
			return this.evaluationEntity.getSubEntityByRel('feedback');
		}
		return undefined;
	}

	get _gradeEntity() {
		if (this.evaluationEntity) {
			return this.evaluationEntity.getSubEntityByRel('grade');
		}
		return undefined;
	}

	async _initializeController() {
		this._controller = new ConsistentEvaluationController(this._evaluationHref, this._token);
		this.evaluationEntity = await this._controller.fetchEvaluationEntity();
		this.evaluationState = this.evaluationEntity.properties.state;
		this.richtextEditorConfig = this._controller.getRichTextEditorConfig(this.evaluationEntity);
	}

	_noFeedbackComponent() {
		return this.evaluationEntity && this.evaluationEntity.getSubEntityByRel('feedback') === undefined;
	}

	_noGradeComponent() {
		return this.evaluationEntity && this.evaluationEntity.getSubEntityByRel('grade') === undefined;
	}

	_isEvaluationPublished() {
		if (!this.evaluationEntity) {
			return false;
		}
		return this.evaluationEntity.properties.state === publishedState;
	}

	_onNextStudentClick() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-next-student-click', {
			composed: true,
			bubbles: true
		}));
	}

	_hideScrollbars() {
		this._scrollbarStatus = 'hidden';
	}

	_showScrollbars() {
		this._scrollbarStatus = 'default';
	}

	async _transientSaveFeedback(e) {
		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		const newFeedbackVal = e.detail;

		this.evaluationEntity = await this._controller.transientSaveFeedback(entity, newFeedbackVal);

		unlock();
	}

	async _transientSaveGrade(e) {
		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		let newGradeVal;
		const type = e.detail.grade.scoreType;
		if (type === GradeType.Letter) {
			newGradeVal = e.detail.grade.letterGrade;
		}
		else if (type === GradeType.Number) {
			newGradeVal = e.detail.grade.score;
		}
		this.evaluationEntity = await this._controller.transientSaveGrade(entity, newGradeVal);

		unlock();
	}

	async _saveEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		this.evaluationEntity = await this._controller.save(entity);
		if (!(this.evaluationEntity instanceof Error)) {
			this._showToast(this.localize('saved'));
		} else {
			this._showToast(this.localize('saveError'));
		}
		this.evaluationState = this.evaluationEntity.properties.state;
		unlock();
	}

	async _updateEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		this.evaluationEntity = await this._controller.update(entity);
		if (!(this.evaluationEntity instanceof Error)) {
			this._showToast(this.localize('updated'));
		} else {
			this._showToast(this.localize('updatedError'));
		}
		this.evaluationState = this.evaluationEntity.properties.state;
		unlock();
	}

	async _publishEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		this.evaluationEntity = await this._controller.publish(entity);
		this.evaluationState = this.evaluationEntity.properties.state;
		if (!(this.evaluationEntity instanceof Error)) {
			this._showToast(this.localize('published'));
		} else {
			this._showToast(this.localize('publishError'));
		}
		this.submissionInfo.evaluationState = publishedState;
		unlock();
	}

	async _retractEvaluation() {
		window.dispatchEvent(new CustomEvent('d2l-flush', {
			composed: true,
			bubbles: true
		}));

		const unlock = await this._mutex.lock();
		const entity = await this._controller.fetchEvaluationEntity(false);
		this.evaluationEntity = await this._controller.retract(entity);
		if (!(this.evaluationEntity instanceof Error)) {
			this._showToast(this.localize('retracted'));
		} else {
			this._showToast(this.localize('retractError'));
		}
		this.evaluationState = this.evaluationEntity.properties.state;
		this.submissionInfo.evaluationState = draftState;
		unlock();
	}

	_showToast(message) {
		this._toastMessage = message;
		this._displayToast = true;
	}

	_onToastClose() {
		this._displayToast = false;
	}

	_renderToast() {
		return html`<d2l-alert-toast
			?open=${this._displayToast}
			button-text=""
			@d2l-alert-toast-close=${this._onToastClose}>${this._toastMessage}</d2l-alert-toast>`;
	}

	render() {
		return html`
			<d2l-template-primary-secondary primary-overflow="${this._scrollbarStatus}">
				<div slot="header"><h1>Hello, consistent-evaluation!</h1></div>
				<div slot="primary" class="d2l-consistent-evaluation-page-primary-slot">
					<d2l-consistent-evaluation-left-panel
						.submissionInfo=${this.submissionInfo}
						.token=${this.token}
						@d2l-consistent-evaluation-left-panel-render-evidence=${this._hideScrollbars}
						@d2l-consistent-evaluation-left-panel-render-submission-list=${this._showScrollbars}
					></d2l-consistent-evaluation-left-panel>
				</div>
				<div slot="secondary">
					<consistent-evaluation-right-panel
						evaluation-href=${this.evaluationHref}
						.feedbackText=${this._feedbackText}
						rubric-href=${ifDefined(this.rubricHref)}
						rubric-assessment-href=${ifDefined(this.rubricAssessmentHref)}
						outcomes-href=${ifDefined(this.outcomesHref)}
						.richTextEditorConfig=${this.richtextEditorConfig}
						.grade=${this._grade}
						.gradeItemInfo=${this.gradeItemInfo}
						.token=${this.token}
						?rubric-read-only=${this.rubricReadOnly}
						?rich-text-editor-disabled=${this.richTextEditorDisabled}
						?hide-rubric=${this.rubricHref === undefined}
						?hide-grade=${this._noGradeComponent()}
						?hide-outcomes=${this.outcomesHref === undefined}
						?hide-feedback=${this._noFeedbackComponent()}
						@on-d2l-consistent-eval-feedback-edit=${this._transientSaveFeedback}
						@on-d2l-consistent-eval-grade-changed=${this._transientSaveGrade}
					></consistent-evaluation-right-panel>
				</div>
				<div slot="footer">
					${this._renderToast()}
					<d2l-consistent-evaluation-footer-presentational
						next-student-href=${ifDefined(this.nextStudentHref)}
						?published=${this._isEvaluationPublished()}
						@d2l-consistent-evaluation-on-publish=${this._publishEvaluation}
						@d2l-consistent-evaluation-on-save-draft=${this._saveEvaluation}
						@d2l-consistent-evaluation-on-retract=${this._retractEvaluation}
						@d2l-consistent-evaluation-on-update=${this._updateEvaluation}
						@d2l-consistent-evaluation-on-next-student=${this._onNextStudentClick}
					></d2l-consistent-evaluation-footer-presentational>
				</div>
			</d2l-template-primary-secondary>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-page', ConsistentEvaluationPage);
