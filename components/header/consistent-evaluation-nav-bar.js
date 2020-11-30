
import 'd2l-navigation/d2l-navigation-immersive.js';
import 'd2l-navigation/components/d2l-navigation-iterator/d2l-navigation-iterator.js';
import 'd2l-navigation/d2l-navigation-link-back.js';
import '@brightspace-ui/core/components/tooltip/tooltip.js';

import { css, html, LitElement } from 'lit-element';
import { heading3Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

class ConsistentEvaluationNavBar extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			titleName: {
				attribute: 'title-name',
				type: String
			},
			subtitleName: {
				attribute: 'subtitle-name',
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
			isGroupActivity: {
				attribute: 'is-group-activity',
				type: Boolean
			}
		};
	}

	static get styles() {
		return [labelStyles, heading3Styles, css`
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

			h1 {
				margin: 0 !important;
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

			@media (max-width: 929px) and (min-width: 768px) {
				.d2l-consistent-evaluation-immersive-navigation {
					margin: 0 1.2rem;
				}
			}

			@media (max-width: 767px) {
				.d2l-consistent-evaluation-immersive-navigation {
					margin: 0 0.9rem;
				}
			}

		`];
	}

	_dispatchButtonClickNavigationEvent(eventName) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-navigate', {
			detail: { key: eventName},
			composed: true,
			bubbles: true
		}));
	}

	_emitPreviousStudentEvent() { this._dispatchButtonClickNavigationEvent('previous');}
	_emitNextStudentEvent() { this._dispatchButtonClickNavigationEvent('next'); }

	_onNavigateBack(e) {
		e.preventDefault();
		this._dispatchButtonClickNavigationEvent('back');
	}

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
					text="${ifDefined(this.returnHrefText)}"
					@click=${this._onNavigateBack} >
				</d2l-navigation-link-back>

				<d2l-navigation-link-back
					class="d2l-short-back"
					href=${this.returnHref}
					@click=${this._onNavigateBack}>
				</d2l-navigation-link-back>
			`;
		}
	}

	_renderIteratorButtons() {
		if (this.iteratorIndex !== undefined || this.iteratorTotal !== undefined) {

			const iteratorText = this.isGroupActivity ? 'groupIteratorText' : 'userIteratorText';

			return html`
				<d2l-navigation-iterator
					slot="right"
					@previous-click=${this._emitPreviousStudentEvent}
					@next-click=${this._emitNextStudentEvent}
					?previous-disabled=${(this.iteratorIndex === 1 || this.iteratorIndex === undefined)}
					?next-disabled=${(this.iteratorIndex === this.iteratorTotal || this.iteratorIndex === undefined || this.iteratorIndex === undefined)}
					hide-text>

					<div class="d2l-iterator-space">
						<span class="d2l-iterator-text d2l-label-text">${this.localize(iteratorText, { num: this.iteratorIndex, total: this.iteratorTotal }) }</span>
					</div>

				</d2l-navigation-iterator>
			`;
		}
	}

	render() {
		return html`
			<div class="d2l-consistent-evaluation-immersive-navigation">
				<d2l-navigation-immersive width-type="fullscreen">
					<div slot="left">
						${this._renderBackButton()}
					</div>

					<div slot="middle">
						<h1 id="titleName" class="d2l-heading-3 d2l-truncate">${this.titleName}</h1>
						<div id="subtitleName" class="d2l-label-text d2l-truncate">${this.subtitleName}</div>
						<d2l-tooltip for="titleName"> ${this.titleName}</d2l-tooltip>
						<d2l-tooltip for="subtitleName">${this.subtitleName}</d2l-tooltip>
					</div>

					${this._renderIteratorButtons()}

				</d2l-navigation-immersive>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-nav-bar', ConsistentEvaluationNavBar);
