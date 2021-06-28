import './consistent-evaluation-rubric.js';
import '@brightspace-ui/core/components/alert/alert.js';
import { css, html, LitElement } from 'lit-element';
import { publishedState, saveGradeActionName } from '../controllers/constants.js';
import { ConsistentEvaluationHrefController } from '../controllers/ConsistentEvaluationHrefController.js';
import { convertToken } from '../helpers/converterHelpers.js';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';

export class ConsistentEvaluationPopupRubric extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			href: { type: String },
			token: {
				type: Object,
				reflect: true,
				converter: (value) => convertToken(value),
			},
			useNewBrightspaceEditor: {
				attribute: 'use-new-brightspace-editor',
				type: Boolean
			},
			_published: { type: Boolean },
			_pageTitle: { type: String },
			_rubricInfos: { type: Array },
			_canSaveOverallGrade: { type: Boolean }
		};
	}

	static get styles() {
		return [css`
			.d2l-consistent-evaluation-rubric-warning {
				margin: 0.75rem 0.75rem 1rem 0.75rem;
				max-width: initial;
				width: initial;
			}
		`];
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
			<d2l-alert
				class="d2l-consistent-evaluation-rubric-warning"
				?hidden=${!this._published}
				type="warning"
			>
				${this.localize('rubricPublishedWarning')}
			</d2l-alert>
		    <d2l-consistent-evaluation-rubric
				header=${this.localize('rubrics')}
				.rubricInfos=${this._rubricInfos}
				.token=${this.token}
				?can-save-overall-grade=${this._canSaveOverallGrade}
				?use-new-brightspace-editor=${this.useNewBrightspaceEditor}
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

			const evaluationEntity = await controller.getEvaluationEntity();
			const gradeEntity = evaluationEntity.entity.getSubEntityByRel('grade');
			if (gradeEntity) {
				this._canSaveOverallGrade = gradeEntity.hasActionByName(saveGradeActionName);
			} else {
				this._canSaveOverallGrade = false;
			}

			if (evaluationEntity.entity.properties.state === publishedState) {
				this._published = true;
			} else {
				this._published = false;
			}
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
