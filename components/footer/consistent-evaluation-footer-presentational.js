import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-icon.js';
import { css, html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationFooterPresentational extends LocalizeConsistentEvaluation(LitElement) {
	static get properties() {
		return {
			anonymousInfo: {
				attribute: false,
				type: Object
			},
			published: {
				type: Boolean
			},
			allowEvaluationWrite: {
				attribute: 'allow-evaluation-write',
				type: Boolean
			},
			allowEvaluationDelete: {
				attribute: 'allow-evaluation-delete',
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
				align-items: center;
				display: flex;
				justify-content: flex-end;
			}
			.d2l-button-container {
				margin: 0 0.3rem;
			}
		`;
	}

	constructor() {
		super();
		this.published = false;
		this.showNextStudent = false;
		this.allowEvaluationWrite = false;
		this.allowEvaluationDelete = false;
	}

	_dispatchButtonClickEvent(eventName) {
		this.dispatchEvent(new CustomEvent(eventName, {
			composed: true,
			bubbles: true
		}));
	}

	_dispatchButtonClickNavigationEvent(eventName) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-navigate', {
			detail: { key: eventName},
			composed: true,
			bubbles: true
		}));
	}

	_emitPublishEvent()     { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-publish'); }
	_emitRetractEvent()     { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-retract'); }
	_emitUpdateEvent()      { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-update'); }
	_emitSaveDraftEvent()   { this._dispatchButtonClickEvent('d2l-consistent-evaluation-on-save-draft'); }
	_emitNextStudentEvent() { this._dispatchButtonClickNavigationEvent('next'); }

	_getPublishOrUpdateButton() {
		const text = this.published ? this.localize('update') : this.localize('publish');
		const eventEmitter = this.published ? this._emitUpdateEvent : this._emitPublishEvent;
		const id = `consistent-evaluation-footer-${text.toLowerCase()}`;

		const shouldDisablePublishButton = this.anonymousInfo ? this.anonymousInfo.isAnonymous && !this.anonymousInfo.assignmentHasPublishedSubmission : false;
		const buttonHtml = html`<d2l-button primary id=${id} @click=${eventEmitter} ?disabled=${shouldDisablePublishButton} >${text}</d2l-button>`;

		if (!this.allowEvaluationWrite) {
			return html ``;
		} else if (shouldDisablePublishButton) {
			return html`
				${buttonHtml}
				<d2l-tooltip for=${id} visibile=false> ${this.localize('anonymousMarkingPublishButtonSummary')}</d2l-tooltip>`;
		} else {
			return buttonHtml;
		}
	}

	_getSaveDraftOrRetractButton() {

		let text;
		let eventEmitter;

		if (this.published) {
			if (this.allowEvaluationDelete) {
				text = this.localize('retract');
				eventEmitter =  this._emitRetractEvent;
			} else {
				return html ``;
			}
		} else {
			if (this.allowEvaluationWrite) {
				text = this.localize('saveDraft');
				eventEmitter =  this._emitSaveDraftEvent;
			} else {
				return html ``;
			}
		}

		const id = `consistent-evaluation-footer-${text.toLowerCase().split(' ').join('-')}`;
		return this.allowEvaluationWrite ? html`<d2l-button id=${id} @click=${eventEmitter}>${text}</d2l-button>` : html``;
	}

	_getNextStudentButton() {
		return this.showNextStudent ? html`
			<d2l-navigation-button
				id="consistent-evaluation-footer-next-student"
				hide-highlight
				text="${this.localize('nextStudent')}"
				@click="${this._emitNextStudentEvent}"
				ariaDescribedbyText="${this.localize('nextStudent')}">
				<div>
					<d2l-icon icon="d2l-tier3:chevron-right-circle"></d2l-icon>
				</div>
			</d2l-navigation-button>`
			: null;
	}

	render() {
		return html`
			<div id="footer-container">
				<div class="d2l-button-container">
					${this._getPublishOrUpdateButton()}
				</div>
				<div class="d2l-button-container">
					${this._getSaveDraftOrRetractButton()}
				</div>
				<div class="d2l-button-container">
					${this._getNextStudentButton()}
				</div>
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-footer-presentational', ConsistentEvaluationFooterPresentational);
