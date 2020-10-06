import 'd2l-outcomes-overall-achievement/src/primary-panel/primary-panel.js';
import { html, LitElement } from 'lit-element';

export class ConsistentEvaluationOutcomesOverallAchievement extends LitElement {

	static get properties() {
		return {
			href: { type: String },
			token: { type: String }
		};
	}

	render() {
		return html`
            <d2l-coa-primary-panel
                href=${this.href}
                .token=${this.token}
            >
            </d2l-coa-primary-panel>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-outcomes-overall-achievement', ConsistentEvaluationOutcomesOverallAchievement);
