import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';

export class ConsistentEvaluationFooterPresentational extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			published: {
				type: Boolean
			},
			showNextStudent: {
				attribute: 'show-next-student',
				type: Boolean
			}
		};
	}
	static get styles() {
		return css`
			#footer-container {
				display: flex;
				justify-content: flex-end;
				align-items: center;
			}
			.button-container {
				margin: 0 0.3rem
			}
		`;
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();
		this.published = false;
		this.showNextStudent = false;
	}

	_dispatchButtonClickEvent(eventName) {
		this.dispatchEvent(new CustomEvent(eventName, {
			composed: true,
			bubbles: true
		}));
	}

	_emitPublishEvent()     { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-publish'); }
	_emitRetractEvent()     { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-retract'); }
	_emitUpdateEvent()      { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-update'); }
	_emitSaveDraftEvent()   { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-save-draft'); }
	_emitNextStudentEvent() { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-next-student'); }

	_getPublishOrRetractButton() {
		const text = this.published ? this.localize('retract') : this.localize('publish');
		const eventEmitter = this.published ? this._emitRetractEvent : this._emitPublishEvent;
		const id = `consistent-evaluation-footer-${text.toLowerCase()}`;
		return html`<d2l-button primary id=${id} @click=${eventEmitter} >${text}</d2l-button>`;
	}

	_getSaveDraftOrUpdateButton() {
		const text = this.published ? this.localize('update') : this.localize('saveDraft');
		const eventEmitter = this.published ? this._emitUpdateEvent : this._emitSaveDraftEvent;
		const id = `consistent-evaluation-footer-${text.toLowerCase().split(' ').join('-')}`;
		return html`<d2l-button id=${id} @click=${eventEmitter}>${text}</d2l-button>`;
	}

	_getNextStudentButton() {
		return this.showNextStudent ? html`
			<d2l-button-icon
				id="consistent-evaluation-footer-next-student"
				icon="tier3:chevron-right-circle"
				@click=${this._emitNextStudentEvent}
				aria-label="Next Student"
			></d2l-button-icon>
		` : html``;
	}

	render() {
		return html`
			<div id="footer-container">
				<div class="button-container">
					${this._getPublishOrRetractButton()}
				</div>
				<div class="button-container">
					${this._getSaveDraftOrUpdateButton()}
				</div>
				<div class="button-container">
					${this._getNextStudentButton()}
				</div>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-footer-presentational', ConsistentEvaluationFooterPresentational);
