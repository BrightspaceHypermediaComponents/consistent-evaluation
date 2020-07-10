import './footer/consistent-evaluation-footer.js';
import './right-panel/consistent-evaluation-right-panel.js';
import './left-panel/consistent-evaluation-submissions-page.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import '@brightspace-ui/core/templates/primary-secondary/primary-secondary.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { evaluationRel, publishedState } from './controllers/constants.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';

export default class ConsistentEvaluationPage extends LitElement {

	static get properties() {
		return {
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			evaluationState: {
				attribute: 'evaluation-state',
				type: String
			},
			feedbackText: {
				attribute: false,
				type: String
			},
			grade: {
				attribute: false,
				type: Object
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
			submissionList: {
				attribute: 'submission-list',
				type: Array
			},
			token: {
				type: String
			},
			_feedbackEntity: {
				attribute: false
			},
			_gradeEntity: {
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
			d2l-consistent-evaluation-submissions-page {
				width: 100%;
			}
		`;
	}

	constructor() {
		super();
		this._evaluationHref = undefined;
		this._token = undefined;

		this._controller = undefined;
		this._evaluationEntity = undefined;
	}

	get evaluationEntity() {
		return this._evaluationEntity;
	}

	set evaluationEntity(entity) {
		const oldVal = this.evaluationEntity;
		if (oldVal !== entity) {
			this._evaluationEntity = entity;
			this.evaluationHref = entity.getLinkByRel(evaluationRel).href;
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

	get feedbackText() {
		if (this._feedbackEntity && this._feedbackEntity.properties) {
			return this._feedbackEntity.properties.text || '';
		}
		return '';
	}

	get grade() {
		if (this._gradeEntity) {
			return this._controller.parseGrade(this._gradeEntity);
		}
		return undefined;
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

	async _transientSaveFeedback(e) {
		const newFeedbackVal = e.detail;
		this.evaluationEntity = await this._controller.transientSaveFeedback(this.evaluationEntity, newFeedbackVal);
	}

	async _transientSaveGrade(e) {
		const newGradeVal = e.detail;
		this.evaluationEntity = await this._controller.transientSaveGrade(this.evaluationEntity, newGradeVal);
	}

	async _saveEvaluation() {
		this.evaluationEntity = await this._controller.save(this.evaluationEntity);
		this.evaluationState = this.evaluationEntity.properties.state;
	}

	async _updateEvaluation() {
		this.evaluationEntity = await this._controller.update(this.evaluationEntity);
		this.evaluationState = this.evaluationEntity.properties.state;
	}

	async _publishEvaluation() {
		this.evaluationEntity = await this._controller.publish(this.evaluationEntity);
		this.evaluationState = this.evaluationEntity.properties.state;
	}

	async _retractEvaluation() {
		this.evaluationEntity = await this._controller.retract(this.evaluationEntity);
		this.evaluationState = this.evaluationEntity.properties.state;
	}

	render() {
		return html`
			<d2l-template-primary-secondary>
				<div slot="header"><h1>Hello, consistent-evaluation!</h1></div>
				<div slot="primary">
					<d2l-consistent-evaluation-submissions-page
					.due-date=${this.submissionInfo && this.submissionInfo.dueDate}
					evaluation-state=${this.submissionInfo && this.submissionInfo.evaluationState}
					submission-type=${this.submissionInfo && this.submissionInfo.submissionType}
					.submission-list=${this.submissionInfo && this.submissionInfo.submissionList}
					.token=${this.token}></d2l-consistent-evaluation-submissions-page>
				</div>
				<div slot="secondary">
					<consistent-evaluation-right-panel
						.grade=${this.grade}
						rubric-href=${this.rubricHref}
						rubric-assessment-href=${this.rubricAssessmentHref}
						outcomes-href=${this.outcomesHref}
						feedback-text=${this.feedbackText}
						.token=${this.token}
						?rubric-read-only=${this.rubricReadOnly}
						?rich-text-editor-disabled=${this.richTextEditorDisabled}
						?hide-rubric=${this.rubricHref === undefined}
						?hide-grade=${this._noGradeComponent()}
						?hide-outcomes=${this.outcomesHref === undefined}
						?hide-feedback=${this._noFeedbackComponent()}
						@on-d2l-consistent-eval-transient-save-feedback=${this._transientSaveFeedback}
						@on-d2l-consistent-eval-transient-save-grade=${this._transientSaveGrade}
					></consistent-evaluation-right-panel>
				</div>
				<div slot="footer">
					<d2l-consistent-evaluation-footer-presentational
						?published=${this._isEvaluationPublished()}
						.next-student-href=${this.nextStudentHref}
						@on-publish=${this._publishEvaluation}
						@on-save-draft=${this._saveEvaluation}
						@on-retract=${this._retractEvaluation}
						@on-update=${this._updateEvaluation}
						@on-next-student=${this._onNextStudentClick}
					></d2l-consistent-evaluation-footer-presentational>
				</div>
			</d2l-template-primary-secondary>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-page', ConsistentEvaluationPage);
