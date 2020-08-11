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
			token: { type: String },
			_rubricReadOnly: { type: Boolean },
			_richTextEditorDisabled: { type: Boolean },
			_childHrefs: { type: Object },
			_submissionInfo: { type: Object }
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
				rubric-href=${ifDefined(this._childHrefs && this._childHrefs.rubricHref)}
				rubric-assessment-href=${ifDefined(this._childHrefs && this._childHrefs.rubricAssessmentHref)}
				outcomes-href=${ifDefined(this._childHrefs && this._childHrefs.outcomesHref)}
				evaluation-href=${ifDefined(this._childHrefs && this._childHrefs.evaluationHref)}
				next-student-href=${ifDefined(this._childHrefs && this._childHrefs.nextHref)}
				.submissionInfo=${this._submissionInfo}
				.token=${this.token}
				?rubric-read-only=${this._rubricReadOnly}
				?rich-text-editor-disabled=${this._richTextEditorDisabled}
				@d2l-consistent-eval-next-student-click=${this.onNextStudentClick}
			></d2l-consistent-evaluation-page>
		`;
	}
}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
