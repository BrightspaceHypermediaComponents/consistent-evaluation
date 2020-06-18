import './footer/consistent-evaluation-footer.js';
import './right-panel/consistent-evaluation-right-panel.js';
import './left-panel/consistent-evaluation-submissions-page.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import '@brightspace-ui/core/templates/primary-secondary/primary-secondary.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';

export default class ConsistentEvaluationPage extends LitElement {

	static get properties() {
		return {
			rubricHref: { type: String },
			rubricAssessmentHref: { type: String },
			outcomesHref: { type: String },
			gradeHref: { type: String },
			feedbackHref: { type: String },
			evaluationHref: { type: String },
			nextStudentHref: { type: String },
			token: { type: String },
			rubricReadOnly: { type: Boolean },
			richTextEditorDisabled: { type: Boolean },
			submissionList: { type: Array },
			evaluationState: { type: String }
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
			this.evaluationHref = entity.links[1].href;
			this.requestUpdate('evaluationEntity', oldVal);
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

	async _initializeController() {
		this._controller = new ConsistentEvaluationController(this._evaluationHref, this._token);
		this.evaluationEntity = await this._controller.fetchEvaluationEntity();
		this.evaluationState = this.evaluationEntity.properties.state;
	}

	_onNextStudentClick() {
		this.dispatchEvent(new CustomEvent('next-student-click', {
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
					<div>
						<span>evidence</span>
						<d2l-consistent-evaluation-submissions-page
						.submissionList=${this.submissionList}
						evaluationState=${this.evaluationState}
						.token=${this.token}></d2l-consistent-evaluation-submissions-page>
					</div>
				</div>
				<div slot="secondary">
					<consistent-evaluation-right-panel
						.evaluationHref=${this.evaluationHref}
						rubricHref=${this.rubricHref}
						rubricAssessmentHref=${this.rubricAssessmentHref}
						outcomesHref=${this.outcomesHref}
						gradeHref=${this.gradeHref}
						.feedbackHref=${this.feedbackHref}
						.token=${this.token}
						?rubricReadOnly=${this.rubricReadOnly}
						?richTextEditorDisabled=${this.richTextEditorDisabled}
						?hideRubric=${this.rubricHref === undefined}
						?hideGrade=${this.gradeHref === undefined}
						?hideOutcomes=${this.outcomesHref === undefined}
						?hideFeedback=${this.feedbackHref === undefined}
						@on-transient-save-feedback=${this._transientSaveFeedback}
						@on-transient-save-grade=${this._transientSaveGrade}
					></consistent-evaluation-right-panel>
				</div>
				<div slot="footer">
					<d2l-consistent-evaluation-footer
						.evaluationEntity=${this.evaluationEntity}
						.nextStudentHref=${this.nextStudentHref}
						@on-publish=${this._publishEvaluation}
						@on-save-draft=${this._saveEvaluation}
						@on-retract=${this._retractEvaluation}
						@on-update=${this._updateEvaluation}
						@on-next-student=${this._onNextStudentClick}
					></d2l-consistent-evaluation-footer>
				</div>
			</d2l-template-primary-secondary>
		`;
	}

}
customElements.define('d2l-consistent-evaluation-page', ConsistentEvaluationPage);
