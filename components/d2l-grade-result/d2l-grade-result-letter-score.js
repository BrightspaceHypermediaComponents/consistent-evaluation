import { css, html, LitElement } from 'lit-element';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

export class D2LGradeResultLetterScore extends LitElement {

	static get styles() {
		return [selectStyles, css`
			#d2l-grade-result-letter-score-container {
				width: 8rem;
				margin-right: 0.5rem;
			}
			#d2l-grade-result-letter-score-select {
				width: 100%;
			}
		`];
	}

	render() {
		return html`
			<div id="d2l-grade-result-letter-score-container">
				<select id="d2l-grade-result-letter-score-select" class="d2l-input-select">
					<option>A</option>
					<option>B</option>
					<option>C</option>
				</select>
			</div>
		`;
	}
}
customElements.define('d2l-grade-result-letter-score', D2LGradeResultLetterScore);
