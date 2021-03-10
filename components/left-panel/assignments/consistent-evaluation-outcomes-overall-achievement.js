import 'd2l-outcomes-overall-achievement/src/primary-panel/primary-panel.js';
import { html, LitElement } from 'lit-element';

const HMARGIN_NARROW = '12px';
const HMARGIN_WIDE = '18px';
const HMARGIN_PANEL_WIDTH_THRESHOLD_PX = 768;

export class ConsistentEvaluationOutcomesOverallAchievement extends LitElement {

	static get properties() {
		return {
			href: { type: String },
			token: { type: String },
			_hMargin: { type: String, attribute: false }
		};
	}

	constructor() {
		super();
		this._hMargin = HMARGIN_WIDE;
		window.addEventListener('resize', this._onWindowResize.bind(this));
	}

	render() {
		return html`
		<div style="margin: 36px ${this._hMargin};">
			<d2l-coa-primary-panel
				href=${this.href}
				.token=${this.token}
			>
			</d2l-coa-primary-panel>
		</div>
		`;
	}

	_onWindowResize() {
		const boundingRect = this.getBoundingClientRect();
		const panelWidth = boundingRect.width;
		if (panelWidth > HMARGIN_PANEL_WIDTH_THRESHOLD_PX) {
			this._hMargin = HMARGIN_WIDE;
		}
		else {
			this._hMargin = HMARGIN_NARROW;
		}
	}
}

customElements.define('d2l-consistent-evaluation-outcomes-overall-achievement', ConsistentEvaluationOutcomesOverallAchievement);
