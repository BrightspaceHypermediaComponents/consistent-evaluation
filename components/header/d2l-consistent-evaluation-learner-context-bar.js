import './d2l-consistent-evaluation-lcb-user-context.js';
import './d2l-consistent-evaluation-lcb-file-context.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

export class ConsistentEvaluationLearnerContextBar extends RtlMixin(LitElement) {

	static get properties() {
		return {
			userHref: {
				attribute: 'user-href',
				type: String
			},
			groupHref: {
				attribute: 'group-href',
				type: String
			},
			specialAccessHref: {
				attribute: 'special-access-href',
				type: String
			},
			token: {
				type: Object
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			selectedItemName: {
				attribute: 'selected-item-name',
				type: String
			},
			currentFileId: {
				attribute: 'current-file-id',
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				border-bottom: 0.05rem solid var(--d2l-color-gypsum);
				display: flex;
				height: 100%;
				padding: 0.75rem 0 0.75rem 1.5rem;
			}
			:host([hidden]) {
				display: none;
			}
			:host([dir="rtl"]) {
				padding-left: 0;
				padding-right: 1.5rem;
			}
			@media (max-width: 929px) and (min-width: 768px) {
				:host {
					padding-left: 1.2rem;
				}
				:host([dir="rtl"]) {
					padding-left: 0;
					padding-right: 1.2rem;
				}
			}
			@media (max-width: 767px) {
				:host {
					padding-left: 0.9rem;
				}
				:host([dir="rtl"]) {
					padding-left: 0;
					padding-right: 0.9rem;
				}
			}
		`;
	}

	_getIsExempt() {
		return this.submissionInfo && this.submissionInfo.isExempt;
	}

	_getActorHref() {
		return this.userHref ? this.userHref : this.groupHref;
	}

	render() {
		return html`
			<d2l-consistent-evaluation-lcb-user-context
				href="${this._getActorHref()}"
				.token="${this.token}"
				?is-exempt="${this._getIsExempt()}"
				?is-group-activity="${this.groupHref}"
			></d2l-consistent-evaluation-lcb-user-context>
			<d2l-consistent-evaluation-lcb-file-context
				selected-item-name=${this.selectedItemName}
				special-access-href=${this.specialAccessHref}
				current-file-id=${this.currentFileId}
				.submissionInfo="${this.submissionInfo}">
			</d2l-consistent-evaluation-lcb-file-context>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-learner-context-bar', ConsistentEvaluationLearnerContextBar);
