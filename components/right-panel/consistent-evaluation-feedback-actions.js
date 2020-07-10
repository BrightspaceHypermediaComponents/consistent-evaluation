import '@brightspace-ui/core/components/button/button-icon.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/colors/colors';
import '@brightspace-ui/core/components/tooltip/tooltip';
import { css, html, LitElement } from 'lit-element/lit-element';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';

class FeedbackActions extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			canAddFile: {
				attribute: 'can-add-file',
				type: Boolean
			},
			canAddLink: {
				attribute: 'can-add-link',
				type: Boolean
			},
			canAddGoogleDriveLink: {
				attribute: 'can-add-google-drive-link',
				type: Boolean
			},
			canAddOneDriveLink: {
				attribute: 'can-add-one-drive-link',
				type: Boolean
			},
			canRecordAudio: {
				attribute: 'can-record-audio',
				type: Boolean
			},
			canRecordVideo: {
				attribute: 'can-record-video',
				type: Boolean
			},
			showAll: {
				attribute: 'show-all',
				type: Boolean
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				background: var(--d2l-color-regolith);
				border-radius: 6px;
				border: 1px solid var(--d2l-color-mica);
				padding: 12px;
			}

			d2l-button-icon:not([hidden]),
			d2l-button-subtle:not([hidden]) {
				display: inline-block;
			}
		`;
	}

	static async getLocalizeResources(langs) {
		for await (const lang of langs) {
			let translations;
			switch (lang) {
				case 'en':
					translations = await import('../../locales/en.js');
					break;
			}

			if (translations && translations.val) {
				return {
					language: lang,
					resources: translations.val
				};
			}
		}

		return null;
	}

	constructor() {
		super();

		this._tooltipBoundary = {
			left: 32, // padding-left applied to d2l-consistent-evaluation-feedback-actions + padding-left of d2l-button-icon
			right: 0
		};
	}

	_dispatchButtonClick(name) {
		this.dispatchEvent(new CustomEvent(`d2l-consistent-evaluation-feedback-action-${name}`, {
			bubbles: true,
			composed: true
		}));
	}

	_renderIconButton(icon, textKey, eventKey, visible) {
		if (visible || this.showAll) {
			const uniqueId = getUniqueId();
			const text = this.localize(textKey);
			const handler = () => this._dispatchButtonClick(eventKey);
			// Important: keep tooltip content inline, otherwise screenreader gets confused
			return html`
				<d2l-button-icon
					id="${uniqueId}"
					icon="d2l-tier1:${icon}"
					text="${text}"
					@click="${handler}">
				</d2l-button-icon>
				<d2l-tooltip
					for="${uniqueId}"
					aria-hidden="true"
					disable-focus-lock
					.boundary="${this._tooltipBoundary}">${text}</d2l-tooltip>
			`;
		}
	}
	_renderSubtleButton(icon, textKey, eventKey, visible) {
		if (visible || this.showAll) {
			const uniqueId = getUniqueId();
			const text = this.localize(textKey);
			const handler = () => this._dispatchButtonClick(eventKey);
			return html`
				<d2l-button-subtle
					id="${uniqueId}"
					icon="tier1:${icon}"
					text="${text}"
					@click=${handler}>
				</d2l-button-subtle>
			`;
		}
	}

	render() {
		return html`
			<div class="button-container-left">
				${this._renderIconButton('upload', 'addFile', 'add-file', this.canAddFile)}
				${this._renderIconButton('quicklink', 'addQuicklink', 'add-quick-link', this.canAddLink)}
				${this._renderIconButton('link', 'addLink', 'add-link', this.canAddLink)}
				${this._renderIconButton('google-drive', 'addGoogleDriveLink', 'add-google-drive-link', this.canAddGoogleDriveLink)}
				${this._renderIconButton('one-drive', 'addOneDriveLink', 'add-one-drive-link', this.canAddOneDriveLink)}
			</div>

			<div class="button-container-right">
				${this._renderSubtleButton('mic', 'recordAudio', 'record-audio', this.canRecordAudio)}
				${this._renderSubtleButton('file-video', 'recordVideo', 'record-video', this.canRecordVideo)}
			</div>
		`;
	}
}
customElements.define('d2l-consistent-evaluation-feedback-actions', FeedbackActions);
