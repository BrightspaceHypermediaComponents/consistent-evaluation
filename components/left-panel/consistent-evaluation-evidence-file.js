import './consistent-evaluation-evidence-top-bar.js';
import { css, html, LitElement } from 'lit-element';

export class ConsistentEvaluationEvidenceFile extends LitElement {

	static get properties() {
		return {
			url: { type: String },
			token: { type: Object }
		};
	}

	static get styles() {
		return css`
			:host {
				--d2l-top-bar-height: 2.7rem;
			}
			iframe {
				height: calc(100% - var(--d2l-top-bar-height));
				width: 100%;
			}
		`;
	}

	constructor() {
		super();

		window.addEventListener('message', e => {
			if (e.data.type === 'token-request') {
				e.source.postMessage({
					type: 'token-response',
					token: this.token
				}, 'https://s.brightspace.com');
			}
		});
	}

	render() {
		return html`
			<d2l-consistent-evaluation-evidence-top-bar></d2l-consistent-evaluation-evidence-top-bar>
			<iframe
				src="${this.url}"
				frameborder="0"
				scrolling="no"
				allow="fullscreen"
			></iframe>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-evidence-file', ConsistentEvaluationEvidenceFile);
