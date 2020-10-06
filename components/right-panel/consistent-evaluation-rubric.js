import 'd2l-rubric/d2l-rubric.js';
import './consistent-evaluation-right-panel-block';
import { html, LitElement } from 'lit-element';

class ConsistentEvaluationRubric extends LitElement {
	static get properties() {
		return {
			header: {
				type: String
			},
			href: {
				type: String
			},
			assessmentHref: {
				attribute: 'assessment-href',
				type: String
			},
			token: {
				type: String
			},
			readonly: {
				attribute: 'read-only',
				type: Boolean
			}
		};
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block title="${this.header}">
				<d2l-rubric
					href=${this.href}
					assessment-href=${this.assessmentHref}
					.token=${this.token}
					?read-only=${this.readonly}
					force-Compact
					overall-score-flag
				>
				</d2l-rubric>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-rubric', ConsistentEvaluationRubric);
