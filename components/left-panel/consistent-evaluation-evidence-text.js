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
			downloadUrl: {
				attribute: 'download-url',
				type: String
			},
			content: { type: String } //html string
		};
	}

	static get styles() {
		return [bodyStandardStyles, heading2Styles, css`
			.d2l-consistent-eval-text-evidence {
				padding-bottom: 2rem;
				padding-left: 0.8rem;
				padding-right: 0.8rem;
			}
			.d2l-consistent-eval-text-evidence-options {
				margin-right: 0.8rem;
			}
			.d2l-consistent-eval-text-evidence-title {
				margin-bottom: 1rem;
			}
			.d2l-consistent-eval-text-evidence-submitted-date {
				margin-bottom: 2rem;
			}
		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	render() {
		return html`
			<d2l-consistent-evaluation-evidence-top-bar>
				<d2l-dropdown-more class="d2l-consistent-eval-text-evidence-options" text="${this.localize('moreOptions')}">
					<d2l-dropdown-menu id="dropdown" boundary="{&quot;right&quot;:10}">
						<d2l-menu>
							<d2l-menu-item-link text="${this.localize('download')}" href="${this.downloadUrl}"></d2l-menu-item-link>
						</d2l-menu>
					</d2l-dropdown-menu>
				</d2l-dropdown-more>
			</d2l-consistent-evaluation-evidence-top-bar>

			<div class="d2l-consistent-eval-text-evidence">
				<h2 class="heading-2 d2l-consistent-eval-text-evidence-title">${this.title}</h2>
				<span class="d2l-consistent-eval-text-evidence-submitted-date">${this.localize('submitted')}: ${this.date}</span>
				${unsafeHTML(this.content)}
			</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-text', ConsistentEvaluationEvidenceText);
