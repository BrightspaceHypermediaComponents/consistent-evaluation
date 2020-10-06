
import 'd2l-navigation/d2l-navigation-immersive.js';
import 'd2l-navigation/components/d2l-navigation-iterator/d2l-navigation-iterator.js';
import 'd2l-navigation/d2l-navigation-link-back.js';
import '@brightspace-ui/core/components/tooltip/tooltip.js';

import { css, html, LitElement } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

class ConsistentEvaluationNavBar extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			assignmentName: {
				attribute: 'assignment-name',
				type: String
			},
			organizationName: {
				attribute: 'organization-name',
				type: String
			},
			iteratorTotal: {
				attribute: 'iterator-total',
				type: Number
			},
			iteratorIndex: {
				attribute: 'iterator-index',
				type: Number
			},
			returnHref: {
				attribute: 'return-href',
				type: String
			},
			returnHrefText: {
				attribute: 'return-href-text',
				type: String
			},
		};
	}

	static get styles() {
		return [labelStyles, css`
			.d2l-short-back {
				display: none;
			}
			.d2l-iterator-text {
				padding-left: 4rem;
				padding-right: 4rem;
			}
			.d2l-heading-3 {
				padding-top: 0.25rem;
			}
			.d2l-truncate {
				overflow: hidden;
				overflow-wrap: break-word;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			@media (max-width: 929px) {
				.d2l-iterator-text {
					padding-left: 1rem;
					padding-right: 1rem;
				}
			}

			@media (max-width: 556px) {
				.d2l-iterator-text {
					display: none;
				}
				.d2l-iterator-space {
					min-width: 1rem;
				}
				.d2l-short-back {
					display: inline-block;
				}
				.d2l-full-back {
					display: none;
				}
			}

		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	_dispatchButtonClickEvent(eventName) {
		this.dispatchEvent(new CustomEvent(eventName, {
			composed: true,
			bubbles: true
		}));
	}

	_emitPreviousStudentEvent() { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-previous-student');}
	_emitNextStudentEvent() { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-next-student'); }

	_renderBackButton() {
		if (this.returnHref === undefined) {
			return html``;
		}
		else {
			this.returnHrefText = (this.returnHrefText === undefined) ? undefined : `${this.returnHrefText}`;

			return html`
				<d2l-navigation-link-back 
					class="d2l-full-back"
					href=${this.returnHref}
					text=${ifDefined(this.returnHrefText)} >
				</d2l-navigation-link-back>

				<d2l-navigation-link-back 
					class="d2l-short-back"
					href=${this.returnHref}>
				</d2l-navigation-link-back>
			`;
		}
	}

	render() {
		return html`
			<d2l-navigation-immersive
				width-type="fullscreen">

				<div slot="left">
					${this._renderBackButton()}
				</div>

				<div slot="middle">
					<div id="assignmentName" class="d2l-heading-3 d2l-truncate">${this.assignmentName}</div>
					<div id="className" class="d2l-label-text d2l-truncate">${this.organizationName}</div>
					<d2l-tooltip for="assignmentName"> ${this.assignmentName}</d2l-tooltip>
					<d2l-tooltip for="className">${this.organizationName}</d2l-tooltip>
				</div>

				<d2l-navigation-iterator 
					slot="right"
					@previous-click=${this._emitPreviousStudentEvent} 
					@next-click=${this._emitNextStudentEvent}
					?previous-disabled=${(this.iteratorIndex === 1 || this.iteratorIndex === undefined)}
					?next-disabled=${(this.iteratorIndex === this.iteratorTotal || this.iteratorIndex === undefined || this.iteratorIndex === undefined)}
					hide-text>

					<div class="d2l-iterator-space"> 
						<span class="d2l-iterator-text d2l-label-text">${this.localize('iteratorText', { num: this.iteratorIndex, total: this.iteratorTotal }) }</span>
					</div>

				</d2l-navigation-iterator>
				
			</d2l-navigation-immersive>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-nav-bar', ConsistentEvaluationNavBar);
