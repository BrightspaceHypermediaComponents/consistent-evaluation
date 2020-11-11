import '@brightspace-ui/core/components/list/list-item.js';
import '@brightspace-ui/core/components/list/list-item-content.js';
import '@brightspace-ui/core/components/dialog/dialog-fullscreen.js';

import { css, html, LitElement } from 'lit-element';
import { labelStyles } from '@brightspace-ui/core/components/typography/styles.js';

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
			supportingInfo: {
				type: String
			},
			_dialogOpened: {
				type: Boolean
			},
			_isMobile: {
				type: Boolean
			}
		};
	}

	static get styles() {
		return [labelStyles, css`
			.d2l-block {
				margin-top: 1.35rem;
			}
			.d2l-label-text {
				margin-bottom: 0.4rem;
			}
			.d2l-list-item {
				padding-left: 0.75rem;
				padding-right: 0.75rem;
			}
		`];
	}

	constructor() {
		super();
		this._dialogOpened = false;
		this.noTitle = false;
		this.mobileMediaQuery = window.matchMedia('(max-width: 767px)');
		this._handleResize(this.mobileMediaQuery);
		this._handleResize = this._handleResize.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		if (this.mobileMediaQuery.addEventListener) {
			this.mobileMediaQuery.addEventListener('change', this._handleResize);
		} else {
			this.mobileMediaQuery.addListener(this._handleResize);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this.mobileMediaQuery.removeEventListener) {
			this.mobileMediaQuery.removeEventListener('change', this._handleResize);
		} else {
			this.mobileMediaQuery.removeListener(this._handleResize);
		}
	}

	_handleResize(e) {
		this._isMobile = e.matches;
		if (!e.matches && this._dialogOpened)
		{
			this._toggleOpenDialog();
		}
	}

	_getTitle() {
		return this.noTitle ? html`` : html`<div class="d2l-label-text">${this.title}</div>`;
	}

	_toggleOpenDialog() {
		this._dialogOpened = !this._dialogOpened;
	}

	_renderListItems() {
		return html`
			<d2l-list-item class="d2l-list-item"
				@click=${this._toggleOpenDialog}>
				<d2l-list-item-content class="no-border">
					${this._getTitle()}
					<div slot="supporting-info">${this.supportingInfo}</div>
				</d2l-list-item-content>
			</d2l-list-item>
		`;
	}

	render() {
		if (this._isMobile) {
			return html`
				${this._renderListItems()}
				<d2l-dialog-fullscreen ?opened=${this._dialogOpened} title-text=${this.title}>
					<slot></slot>
				</d2l-dialog-fullscreen>
			`;
		}
		return html`
			<div class="d2l-block">
				${this._getTitle()}
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-right-panel-block', ConsistentEvaluationRightPanelBlock);
