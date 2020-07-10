import './consistent-evaluation-footer-presentational.js';
import { html, LitElement } from 'lit-element';
import { publishedState } from '../controllers/constants.js';

export class ConsistentEvaluationFooter extends LitElement {

	static get properties() {
		return {
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			nextStudentHref: {
				attribute: 'next-student-href',
				type: String
			}
		};
	}

	constructor() {
		super();
		this.nextStudentHref = undefined;
		this.evaluationEntity = undefined;
	}

	_isEntityPublished() {
		if (!this.evaluationEntity) {
			return false;
		}
		return this.evaluationEntity.properties.state === publishedState;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-footer-presentational
				?published=${this._isEntityPublished()}
				?show-next-student=${this.nextStudentHref !== undefined}
			></d2l-consistent-evaluation-footer-presentational>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-footer', ConsistentEvaluationFooter);
