import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import '@brightspace-ui/core/components/dialog/dialog-fullscreen.js';
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
			_opened: {
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
					margin-top: 1.35rem;
					padding-left: 0.75rem;
					padding-right: 0.75rem;
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
		this._opened = false;
		this.noTitle = false;
	}

	_getTitle() {
		return this.noTitle ? html`` : html`<div class="d2l-label-text">${this.title}</div>`;
	}

	_onListItemClick() {
		this._opened = !this._opened;
	}

	_renderListItems() {
		return html`
			<d2l-list-item class="d2l-list-item"
				@click=${this._onListItemClick}>
				<d2l-list-item-content class="no-border">
					${this._getTitle()}
					<div  slot="supporting-info"> supporting info for ${this.title}</div>
				</d2l-list-item-content>
			</d2l-list-item>
		`;
	}

	render() {
		return html`
			${this._renderListItems()}

			<d2l-dialog-fullscreen ?opened=${this._opened} title-text=${this.title}>
				<slot></slot>
			</d2l-dialog-fullscreen>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-right-panel-block', ConsistentEvaluationRightPanelBlock);
