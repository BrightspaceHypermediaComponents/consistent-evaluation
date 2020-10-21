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

		this._handleMessage = this._handleMessage.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('message', this._handleMessage);
	}

	disconnectedCallback() {
		window.removeEventListener('message', this._handleMessage);
		super.disconnectedCallback();
	}

	_handleMessage(e) {
		if (e.data.type === 'token-request') {
			return this._handleTokenRequest(e);
		} else if (e.data.type === 'annotations-update') {
			return this._handleAnnotationsUpdate(e);
		}
	}

	_handleTokenRequest(e) {
		if (typeof this.token === 'string') {
			this._postTokenResponse(e, this.token);
		} else {
			this.token().then(token => {
				this._postTokenResponse(e, token);
			});
		}
	}

	_postTokenResponse(e, token) {
		e.source.postMessage({
			type: 'token-response',
			token: token
		}, 'https://s.brightspace.com');
	}

	_handleAnnotationsUpdate(e) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-annotations-update', {
			composed: true,
			bubbles: true,
			detail: e.data.value
		}));
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
