import './d2l-consistent-evaluation-lcb-user-context.js';
import { css, html, LitElement } from 'lit-element';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

export class ConsistentEvaluationLearnerContextBar extends RtlMixin(LitElement) {

	static get properties() {
		return {
			href: {
				type: String
			},
			token: {
				type: String
			},
			submissionInfo: {
				attribute: false,
				type: Object
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
				height: 100%;
				margin: 0.75rem 0 0.75rem 1.5rem;
			}
			:host([hidden]) {
				display: none;
			}
			:host([dir="rtl"]) {
				margin-left: 0;
				margin-right: 1.5rem;
			}
			@media (max-width: 929px) and (min-width: 768px) {
				:host {
					margin-left: 1.2rem;
				}
				:host([dir="rtl"]) {
					margin-left: 0;
					margin-right: 1.2rem;
				}
			}
			@media (max-width: 767px) {
				:host {
					margin-left: 0.9rem;
				}
				:host([dir="rtl"]) {
					margin-left: 0;
					margin-right: 0.9rem;
				}
			}
		`;
	}

	_getIsExempt() {
		if (this.submissionInfo && this.submissionInfo.isExempt) {
			return true;
		} else {
			return false;
		}
	}

	render() {
		return html`
			<d2l-consistent-evaluation-lcb-user-context
				href="${this.href}"
				.token="${this.token}"
				?is-exempt="${this._getIsExempt()}"
			></d2l-consistent-evaluation-lcb-user-context>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-learner-context-bar', ConsistentEvaluationLearnerContextBar);
