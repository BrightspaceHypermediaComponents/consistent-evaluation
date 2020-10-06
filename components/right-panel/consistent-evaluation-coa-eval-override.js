import './consistent-evaluation-right-panel-block';
import 'd2l-outcomes-level-of-achievements/d2l-outcomes-coa-eval-override.js';
import { html, LitElement } from 'lit-element';

class ConsistentEvaluationCoaEvalOverride extends LitElement {
	static get properties() {
		return {
			href: {
				type: String
			},
			token: {
				type: String
			}
		};
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block no-title>
				<d2l-outcomes-coa-eval-override
					href=${this.href}
					.token=${this.token}>
				</d2l-outcomes-coa-eval-override>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-coa-eval-override', ConsistentEvaluationCoaEvalOverride);
