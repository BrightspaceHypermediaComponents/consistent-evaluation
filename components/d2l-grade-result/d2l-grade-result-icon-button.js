import '@brightspace-ui/core/components/button/button-icon.js';
import 'd2l-tooltip/d2l-tooltip.js';
import { html, LitElement } from 'lit-element';

export class D2LGradeResultIconButton extends LitElement {
	static get properties() {
		return {
			tooltipText: { type: String },
			icon: { type: String },
			_id: { type: String }
		};
	}

	constructor() {
		super();
		this._id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	}

	_onClick() {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-icon-button-click', {
			bubbles: true,
			composed: true,
		}));
	}

	render() {
		return html`
			<div>
				<d2l-button-icon
					id="d2l-grade-result-icon-button-${this._id}"
					icon=${this.icon}
					@click=${this._onClick}
				></d2l-button-icon>
				
				${this.tooltipText && this.tooltipText !== '' ? html`
					<d2l-tooltip
						for="d2l-grade-result-icon-button-${this._id}"
						position="bottom"
					>
						${this.tooltipText}
					</d2l-tooltip>
				` : html`` }
			</div>
		`;
	}
}
customElements.define('d2l-grade-result-icon-button', D2LGradeResultIconButton);
