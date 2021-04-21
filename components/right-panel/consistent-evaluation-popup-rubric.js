import './consistent-evaluation-rubric.js';
import { html, LitElement } from 'lit-element';
import { ConsistentEvaluationHrefController } from '../controllers/ConsistentEvaluationHrefController.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';
import { saveGradeActionName } from '../controllers/constants.js';

export class ConsistentEvaluationPopupRubric extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			href: { type: String },
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			_pageTitle: { type: String },
			_rubricInfos: { type: Array },
			_canSaveOverallGrade: { type: Boolean }
		};
	}

	constructor() {
		super();
		this.href = undefined;
		this.token = undefined;
	}

	render() {
		if (!this._rubricInfos) {
			return html ``;
		}
		return html`
		    <d2l-consistent-evaluation-rubric
				header=${this.localize('rubrics')}
				.rubricInfos=${this._rubricInfos}
				.token=${this.token}
				?can-save-overall-grade=${this._canSaveOverallGrade}
				is-popout
			></d2l-consistent-evaluation-rubric>
		`;
	}
	async updated(changedProperties) {
		super.updated();

		if (changedProperties.has('href')) {
			const controller = new ConsistentEvaluationHrefController(this.href, this.token);
			this._rubricInfos = await controller.getRubricInfos();

			this._pageTitle = await controller.getUserName();
			if (!this._pageTitle) {
				this._pageTitle = await controller.getGroupName();
			}
			this.setTitle();

			const evaluationEntity = controller.getEvaluationEntity();
			const gradeEntity = evaluationEntity.getSubEntityByRel('grade');
			this._canSaveOverallGrade = gradeEntity.hasActionByName(saveGradeActionName);
		}

	}

	setTitle() {
		if (this._pageTitle) {
			const title = document.createElement('title');
			title.textContent = `${this.localize('rubricsAssess', 'username', this._pageTitle)}`;
			document.head.insertBefore(title, document.head.firstChild);
		}
	}

}

customElements.define('d2l-consistent-evaluation-popup-rubric', ConsistentEvaluationPopupRubric);
