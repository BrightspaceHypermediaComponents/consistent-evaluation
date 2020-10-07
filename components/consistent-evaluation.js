import './consistent-evaluation-page.js';
import { css, html } from 'lit-element';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { MobxLitElement } from '@adobe/lit-mobx';
import RootStore from './stores/root.js';

export class ConsistentEvaluation extends MobxLitElement {

	static get properties() {
		return {
			href: { type: String },
			token: { type: Object },
			returnHref: {
				attribute: 'return-href',
				type: String
			},
			returnHrefText: {
				attribute: 'return-href-text',
				type: String
			},
			_rubricReadOnly: { type: Boolean },
			_richTextEditorDisabled: { type: Boolean },
			_childHrefs: { type: Object },
			_submissionInfo: { type: Object },
			_gradeItemInfo: { type: Object },
			_assignmentName: { type: String },
			_organizationName: { type: String },
			_iteratorTotal: { type: Number },
			_iteratorIndex: { type: Number }
		};
	}

	static get styles() {
		return css`
			d2l-consistent-evaluation-page {
				width: 100%;
			}
		`;
	}

	constructor() {
		super();
		this.store = new RootStore();

		this.href = undefined;
		this.token = undefined;
		this._rubricReadOnly = false;
		this._richTextEditorDisabled = false;
		this._childHrefs = undefined;
		this._submissionInfo = undefined;
		this._gradeItemInfo = undefined;
		this.returnHref = undefined;
		this.returnHrefText = undefined;
	}

	async updated(changedProperties) {
		super.updated();

		if (changedProperties.has('href')) {
			const controller = new ConsistentEvaluationHrefController(this.href, this.token);
			this._childHrefs = await controller.getHrefs();
			this._submissionInfo = await controller.getSubmissionInfo();
			this._gradeItemInfo = await controller.getGradeItemInfo();
			this._assignmentName = await controller.getAssignmentOrganizationName('assignment');
			this._organizationName = await controller.getAssignmentOrganizationName('organization');
			this._iteratorTotal = await controller.getIteratorInfo('total');
			this._iteratorIndex = await controller.getIteratorInfo('index');
		}
	}

	_onNextStudentClick() {
		this.href = this._childHrefs?.nextHref;
	}

	_onPreviousStudentClick() {
		this.href = this._childHrefs?.previousHref;
	}

	_shouldConfirmUnsavedChanges() {
		return (this._childHrefs && this._childHrefs.userProgressOutcomeHref) !== undefined;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-page
				rubric-href=${ifDefined(this._childHrefs && this._childHrefs.rubricHref)}
				rubric-assessment-href=${ifDefined(this._childHrefs && this._childHrefs.rubricAssessmentHref)}
				outcomes-href=${ifDefined(this._childHrefs && this._childHrefs.alignmentsHref)}
				evaluation-href=${ifDefined(this._childHrefs && this._childHrefs.evaluationHref)}
				next-student-href=${ifDefined(this._childHrefs && this._childHrefs.nextHref)}
				user-href=${ifDefined(this._childHrefs && this._childHrefs.userHref)}
				user-progress-outcome-href=${ifDefined(this._childHrefs && this._childHrefs.userProgressOutcomeHref)}
				coa-demonstration-href=${ifDefined(this._childHrefs && this._childHrefs.coaDemonstrationHref)}
				return-href=${ifDefined(this.returnHref)}
				return-href-text=${ifDefined(this.returnHrefText)}
				.submissionInfo=${this._submissionInfo}
				.gradeItemInfo=${this._gradeItemInfo}
				.assignmentName=${this._assignmentName}
				.organizationName=${this._organizationName}
				.iteratorTotal=${this._iteratorTotal}
				.iteratorIndex=${this._iteratorIndex}
				.token=${this.token}
				?rubric-read-only=${this._rubricReadOnly}
				?rich-text-editor-disabled=${this._richTextEditorDisabled}
				?confirm-unsaved-changes=${this._shouldConfirmUnsavedChanges()}
				@d2l-consistent-evaluation-previous-student-click=${this._onPreviousStudentClick}
				@d2l-consistent-evaluation-next-student-click=${this._onNextStudentClick}
			></d2l-consistent-evaluation-page>
		`;
	}
}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
