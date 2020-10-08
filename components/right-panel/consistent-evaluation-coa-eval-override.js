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

	_emitCoaEvalOverrideChange() {
		this.dispatchEvent(new CustomEvent('on-d2l-consistent-eval-coa-eval-override-changed', {
			composed: true,
			bubbles: true
		}));
	}

	render() {
		return html`
			<d2l-consistent-evaluation-right-panel-block no-title>
				<d2l-outcomes-coa-eval-override
					href=${this.href}
					.token=${this.token}
					@d2l-outcomes-coa-eval-override-change=${this._emitCoaEvalOverrideChange}>
				</d2l-outcomes-coa-eval-override>
			</d2l-consistent-evaluation-right-panel-block>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-coa-eval-override', ConsistentEvaluationCoaEvalOverride);
