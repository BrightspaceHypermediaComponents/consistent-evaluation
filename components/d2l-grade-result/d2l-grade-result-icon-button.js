import '@brightspace-ui/core/components/button/button-icon.js';
import 'd2l-tooltip/d2l-tooltip.js';
import { html, LitElement } from 'lit-element';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';

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
		this._id = getUniqueId();
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

				${this.tooltipText ? html`
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
