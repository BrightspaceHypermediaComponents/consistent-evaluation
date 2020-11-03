import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import { css, html, LitElement } from 'lit-element';
import { heading4Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';

class ConsistentEvaluationRightPanelBlock extends LitElement {
	static get properties() {
		return {
			title: {
				type: String
			},
			noTitle: {
				attribute: 'no-title',
				type: Boolean
			},
			inDialog: {
				attribute: 'in-dialog',
				type: Boolean
			}
		};
	}

	static get styles() {
		return [labelStyles, heading4Styles, css`
			.d2l-block {
				margin-top: 1.35rem;
				padding-left: 0.75rem;
				padding-right: 0.75rem;
			}
			.d2l-label-text {
				margin-bottom: 0.4rem;
			}
			.d2l-list-item {
				display: none;
			}
			@media (max-width: 768px) {
				.d2l-label-text {
					margin-bottom: 0.0rem;
				}
				.d2l-block {
					display: none;
				}
				.d2l-list-item {
					display: block;
					padding: 20px;
					padding-top: 0px;
					padding-bottom: 0px;
					border-top: 1px solid var(--d2l-color-mica);
					border-width: 1px;
				}
			}
		`];
	}

	constructor() {
		super();
		this.noTitle = false;
		this.inDialog = false;
	}

	_getTitle() {
		return this.noTitle ? html`` : html`<div class="d2l-label-text">${this.title}</div>`;
	}

	_onListItemClick(e) {
		this.dispatchEvent(
			new CustomEvent('d2l-consistent-evaluation-right-panel-list-item-clicked', {
				detail: e,
				composed: true,
				bubbles: true
			}));
	}

	_renderAsListItem() {
		return html`
			<d2l-list-item class="d2l-list-item"
				@click=${this._onListItemClick}>
				<d2l-list-item-content class="no-border">
					${this._getTitle()}
					<div slot="supporting-info"> supporting info for ${this.title}</div>
				</d2l-list-item-content>
			</d2l-list-item>
		`;
	}

	render() {
		if (this.inDialog) {
			return html`
				<div class="d2l-block">
					${this._getTitle()}
					<slot></slot>
				</div>
			`;
		}
		return html`
			${this._renderAsListItem()}

			<div class="d2l-block">
				${this._getTitle()}
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-right-panel-block', ConsistentEvaluationRightPanelBlock);
