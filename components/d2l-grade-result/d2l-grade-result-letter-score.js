import { css, html, LitElement } from 'lit-element';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

export class D2LGradeResultLetterScore extends LitElement {

	static get properties() {
		return {
			availableOptions: { type: Array },
			selectedOption: { type: String },
			readOnly: { type: Boolean }
		};
	}

	static get styles() {
		return [selectStyles, bodyStandardStyles, css`
			.d2l-grade-result-letter-score-container {
				width: 8rem;
				margin-right: 0.5rem;
			}
			.d2l-grade-result-letter-score-select {
				width: 100%;
			}
			.d2l-grade-result-letter-score-score-read-only {
				margin-right: 0.5rem;
			}
		`];
	}

	constructor() {
		super();
		this.availableOptions = [];
		this.selectedOption = '';
	}

	_renderOptions() {
		return this.availableOptions.map((option) => {
			if (this.selectedOption === option) {
				return html`<option selected>${option}</option>`;
			} else {
				return html`<option>${option}</option>`;
			}
		});
	}

	_onOptionSelected(e) {
		this.dispatchEvent(new CustomEvent('d2l-grade-result-letter-score-selected', {
			composed: true,
			bubbles: true,
			detail: {
				option: e.target.value
			}
		}));
	}

	render() {
		if (!this.readOnly) {
			return html`
				<div class="d2l-grade-result-letter-score-container">
					<select
						class="d2l-input-select d2l-grade-result-letter-score-select"
						@change=${this._onOptionSelected}
					>
						${this._renderOptions()}
					</select>
				</div>
			`;
		} else {
			return html`
				<div class="d2l-grade-result-letter-score-score-read-only">
					<span class="d2l-body-standard">${this.selectedOption}</span>
				</div>
			`;
		}
	}
}

customElements.define('d2l-grade-result-letter-score', D2LGradeResultLetterScore);
