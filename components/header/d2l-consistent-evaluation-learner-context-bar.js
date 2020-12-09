import './d2l-consistent-evaluation-lcb-user-context.js';
import './d2l-consistent-evaluation-lcb-file-context.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { submissionTypesWithNoEvidence } from '../controllers/constants';

export class ConsistentEvaluationLearnerContextBar extends SkeletonMixin(RtlMixin(LitElement)) {

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
				converter: {
					fromAttribute(value) {
						const retVal = String(value);
						return retVal;
					},
					toAttribute(value) {
						const retVal = Object(value);
						return retVal;
					}
				},
				type: Object
			},
			submissionInfo: {
				attribute: false,
				type: Object
			},
			currentFileId: {
				type: String
			}
		};
	}

	static get styles() {
		return [super.styles, css`
			:host([skeleton]) .d2l-skeleton-user-profile-image {
				height: 1.5rem;
				width: 1.5rem;
			}
			:host([skeleton]) .d2l-skeleton-user-display-name {
				height: 1rem;
				margin-left: 0.5rem;
				width: 7rem;
			}
			:host([skeleton]) .d2l-skeleton-submission-select {
				height: 1rem;
				margin-left: 0.5rem;
				width: 7rem;
			}
			@media (max-width: 930px) {
				:host([skeleton]) .d2l-skeleton-submission-select {
					display: none;
				}
			}
			:host([skeleton][dir="rtl"]) .d2l-skeleton-user-display-name {
				margin-right: 0.5rem;
			}
			:host([skeleton]) .d2l-skeleton-learner-context-bar {
				align-items: center;
				display: flex;
			}
			.d2l-skeleton-learner-context-bar-hidden {
				display: none;
			}
			:host([skeleton]) .d2l-consistent-evaluation-learner-context-bar {
				display: none;
			}
			.d2l-consistent-evaluation-learner-context-bar {
				display: flex;
			}
			:host {
				border-bottom: 0.05rem solid var(--d2l-color-gypsum);
				display: flex;
				height: 100%;
				padding: 0.75rem 0 0.75rem 1.85rem;
			}
			:host([hidden]) {
				display: none;
			}
			:host([dir="rtl"]) {
				padding-left: 0;
				padding-right: 1.85rem;
			}
			@media (max-width: 929px) and (min-width: 768px) {
				:host {
					padding-left: 1.55rem;
				}
				:host([dir="rtl"]) {
					padding-left: 0;
					padding-right: 1.55rem;
				}
			}
			@media (max-width: 767px) {
				:host {
					padding-left: 1.25rem;
				}
				:host([dir="rtl"]) {
					padding-left: 0;
					padding-right: 1.25rem;
				}
			}
			@media (min-width: 930px) {
				:host {
					min-height: 2.1rem;
				}
			}
		`];
	}

	_getIsExempt() {
		return this.submissionInfo && this.submissionInfo.isExempt;
	}

	_getActorHref() {
		return this.userHref ? this.userHref : this.groupHref;
	}

	_getSkeletonClass() {
		let className = 'd2l-skeleton-learner-context-bar';

		if (submissionTypesWithNoEvidence.includes(this.submissionInfo.submissionType)) {
			className = 'd2l-skeleton-learner-context-bar-hidden';
		}

		return className;
	}

	render() {
		return html`
			<div class="${this._getSkeletonClass()}" aria-hidden="${!this.skeleton}" aria-busy="${this.skeleton}">
				<div class="d2l-skeleton-user-profile-image d2l-skeletize"></div>
				<div class="d2l-skeleton-user-display-name d2l-skeletize"></div>
				<div class="d2l-skeleton-submission-select d2l-skeletize"></div>
			</div>
			<div class="d2l-consistent-evaluation-learner-context-bar" aria-hidden="${this.skeleton}">
				<d2l-consistent-evaluation-lcb-user-context
					.href=${this._getActorHref()}
					.token=${this.token}
					?is-exempt=${this._getIsExempt()}
					?is-group-activity=${this.groupHref}
				></d2l-consistent-evaluation-lcb-user-context>
				<d2l-consistent-evaluation-lcb-file-context
					@d2l-consistent-evaluation-submission-list-ready=${this.handleComponentReady}
					.token=${this.token}
					special-access-href=${this.specialAccessHref}
					.currentFileId=${this.currentFileId}
					.submissionInfo=${this.submissionInfo}
				></d2l-consistent-evaluation-lcb-file-context>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-learner-context-bar', ConsistentEvaluationLearnerContextBar);
