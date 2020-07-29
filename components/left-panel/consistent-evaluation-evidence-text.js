import './consistent-evaluation-evidence-top-bar.js';
import { bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

export class ConsistentEvaluationEvidenceText extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			title: { type: String },
			date: { type: String },
			content: { type: String } //html string
		};
	}

	static get styles() {
		return [bodyStandardStyles, heading2Styles, css`
			:host {
				--top-bar-height: 2.7rem;
			}
			.consistent-eval-text-evidence {
				padding-left: 0.8rem;
				padding-bottom: 2rem;
			}
			.consistent-eval-text-evidence-title {
				margin-bottom: 1rem;
			}
			.consistent-eval-text-evidence-submitted-date {
				margin-bottom: 2rem;
			}
		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	render() {
		return html`
			<d2l-consistent-evaluation-evidence-top-bar></d2l-consistent-evaluation-evidence-top-bar>
			<div class="consistent-eval-text-evidence">
				<h2 class="d2l-heading-2 consistent-eval-text-evidence-title">${this.title}</h2>
				<span class="consistent-eval-text-evidence-submitted-date">${this.localize('submitted')}: ${this.date}</span>
				${unsafeHTML(this.content)}
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-text', ConsistentEvaluationEvidenceText);
