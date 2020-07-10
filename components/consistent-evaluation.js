import './consistent-evaluation-page.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import RootStore from './stores/root.js';

export class ConsistentEvaluation extends MobxLitElement {

	static get properties() {
		return {
			href: { type: String },
			token: { type: String },
			_rubricReadOnly: { type: Boolean },
			_richTextEditorDisabled: { type: Boolean },
			_childHrefs: { type: Object },
			_submissionInfo: { type: Object }
		};
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
	}

	async updated(changedProperties) {
		super.updated();

		if (changedProperties.has('href')) {
			const controller = new ConsistentEvaluationHrefController(this.href, this.token);
			this._childHrefs = await controller.getHrefs();
			this._submissionInfo = await controller.getSubmissionInfo();
		}
	}

	onNextStudentClick() {
		this.href = this._childHrefs.nextHref;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-page
				.rubric-href=${this._childHrefs && this._childHrefs.rubricHref}
				.rubric-assessment-href=${this._childHrefs && this._childHrefs.rubricAssessmentHref}
				.outcomes-href=${this._childHrefs && this._childHrefs.outcomesHref}
				.evaluation-href=${this._childHrefs && this._childHrefs.evaluationHref}
				.next-student-href=${this._childHrefs && this._childHrefs.nextHref}
				.submission-info=${this._submissionInfo}
				.token=${this.token}
				?rubric-read-only=${this._rubricReadOnly}
				?rich-text-editor-disabled=${this._richTextEditorDisabled}
				@d2l-consistent-eval-next-student-click=${this.onNextStudentClick}
			></d2l-consistent-evaluation-page>
		`;
	}
}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
