import '@brightspace-ui/core/components/button/button-subtle.js';
import { html, LitElement } from 'lit-element';

export class D2LGradeResultManualOverrideButton extends LitElement {

	static get properties() {
		return {
			isManualOverrideActive: { type: Boolean }
		};
	}

	render() {
		if (this.isManualOverrideActive) {
			return html`
				<d2l-button-subtle
					text="Clear Manual Override"
					icon="tier1:close-default"
					@click=${this._onManualOverrideClearClick}
				></d2l-button-subtle>
			`;
		} else {
			return html`
				<d2l-button-subtle
					text="Manually Override Grade"
					icon="tier1:edit"
					@click=${this._onManualOverrideClick}
				></d2l-button-subtle>
			`;
		}
	}

	_onManualOverrideClick() {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-manual-override-button-manual-override-click', {
			composed: true,
			bubbles: true
		}));
	}

	_onManualOverrideClearClick() {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-manual-override-button-manual-override-clear-click', {
			composed: true,
			bubbles: true
		}));
	}
}

customElements.define('d2l-grade-result-manual-override-button', D2LGradeResultManualOverrideButton);
