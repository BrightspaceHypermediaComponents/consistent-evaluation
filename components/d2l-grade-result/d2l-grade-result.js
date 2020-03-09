import './d2l-grade-result-presentational.js';
import { css, html, LitElement } from 'lit-element';

export class D2LGradeResult extends LitElement {
	static get properties() {
		return {
			href: { type: String },
			token: { type: String }
		};
	}

	static get styles() {
		return css``;
	}

	render() {
		return html`
			<d2l-grade-result-presentational
				labeltext="Overall Grades"
				scorenumerator="5"
				scoredenominator="20"
				gradebuttontooltip="Assignment 1 Grade Item Attached"
				reportsbuttontooltip="Class and user statistics"
				@d2l-grade-result-grade-change=${this.handleGradeChange}
				@d2l-grade-result-grade-button-click=${this.handleGradeButtonClick}
				@d2l-grade-result-reports-button-click=${this.handleReportsButtonClick}
			></d2l-grade-result-presentational>
		`;
	}

	handleGradeChange(e) {
		console.log(e);
	}

	handleGradeButtonClick(e) {
		console.log(e);
	}

	handleReportsButtonClick(e) {
		console.log(e);
	}
}

customElements.define('d2l-grade-result', D2LGradeResult);
