import '@brightspace-ui/core/components/button/button-subtle.js';
import { css, html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationEvidenceTopBar extends LocalizeConsistentEvaluation(LitElement) {

	static get styles() {
		return css`
			.d2l-consistent-evaluation-evidence-top-bar {
				align-items: center;
				border-bottom: 1px solid var(--d2l-color-mica);
				display: flex;
				height: 2.7rem;
				justify-content: space-between;
			}
		`;
	}

	_dispatchBackToUserSubmissionsEvent() {
		const event = new CustomEvent('d2l-consistent-evaluation-evidence-back-to-user-submissions', {
			composed: true,
			bubbles: true
		});
		this.dispatchEvent(event);
	}

	render() {
		return html`
			<div class="d2l-consistent-evaluation-evidence-top-bar">
				<d2l-button-subtle
					text="${this.localize('backToUserSubmissions')}"
					icon="tier1:chevron-left"
					@click="${this._dispatchBackToUserSubmissionsEvent}"
				></d2l-button-subtle>
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-top-bar', ConsistentEvaluationEvidenceTopBar);
