import './consistent-evaluation-evidence-top-bar.js';
import { css, html, LitElement } from 'lit-element';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { pdfExtension } from '../../controllers/constants';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';

export class ConsistentEvaluationEvidenceFile extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			url: { type: String },
			originalFileUrl: { type: String },
			token: { type: Object },
			fileExtension: { type: String },
			displayConversionWarning: {
				attribute: 'display-conversion-warning',
				type: Boolean
			},
			_resizing: { type: Boolean, attribute: false },
			_displayToast: { type: Boolean },
		};
	}

	static get styles() {
		return css`
			:host {
				--d2l-top-bar-height: 2.75rem;
			}
			iframe {
				height: calc(100% - var(--d2l-top-bar-height));
				margin-bottom: -0.5rem;
				width: 100%;
			}
			iframe[data-resizing] {
				pointer-events: none;
			}
		`;
	}

	constructor() {
		super();

		this._resizeStart = this._resizeStart.bind(this);
		this._resizeEnd = this._resizeEnd.bind(this);
		this._handleMessage = this._handleMessage.bind(this);
		this.flush = this.flush.bind(this);

		this._debounceJobs = {};
		this._displayToast = true;
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('d2l-template-primary-secondary-resize-start', this._resizeStart);
		window.addEventListener('d2l-template-primary-secondary-resize-end', this._resizeEnd);
		window.addEventListener('message', this._handleMessage);
		window.addEventListener('d2l-flush', this.flush);
	}

	disconnectedCallback() {
		window.removeEventListener('d2l-template-primary-secondary-resize-start', this._resizeStart);
		window.removeEventListener('d2l-template-primary-secondary-resize-end', this._resizeEnd);
		window.removeEventListener('message', this._handleMessage);
		window.removeEventListener('d2l-flush', this.flush);
		super.disconnectedCallback();
	}

	render() {
		return html`
			<d2l-consistent-evaluation-evidence-top-bar></d2l-consistent-evaluation-evidence-top-bar>
			<iframe
				id="d2l-annotations-iframe"
				?data-resizing=${this._resizing}
				frameborder="0"
				scrolling="no"
				allow="fullscreen"
			></iframe>
			${this._renderToast()}
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('url')) {
			const iframe = this.shadowRoot.getElementById('d2l-annotations-iframe');
			iframe.contentWindow.location.replace(this.url);
		}
	}

	flush() {
		if (this._debounceJobs.annotations && this._debounceJobs.annotations.isActive()) {
			this._debounceJobs.annotations.flush();
		}
	}

	_handleAnnotationsSetup(e) {
		if (typeof this.token === 'string') {
			this._postTokenResponse(e, this.token);
		} else {
			this.token().then(token => {
				this._postTokenResponse(e, token);
			});
		}
		this._postOriginalFileUrl(e, this.originalFileUrl);
	}
	_handleAnnotationsUpdate(e) {
		this._debounceJobs.annotations = Debouncer.debounce(
			this._debounceJobs.annotations,
			timeOut.after(1000),
			() => this.dispatchEvent(new CustomEvent('d2l-consistent-eval-annotations-update', {
				composed: true,
				bubbles: true,
				detail: e.data.value
			}))
		);
	}
	_handleAnnotationsWillChange(e) {
		if (e.data.value === 'TEXT_EDIT_START') {
			this.dispatchEvent(new CustomEvent('d2l-consistent-eval-annotations-will-change', {
				composed: true,
				bubbles: true,
				detail: e.data.value
			}));
		}
	}
	_handleMessage(e) {
		if (e.data.type === 'token-request') {
			return this._handleAnnotationsSetup(e);
		} else if (e.data.type === 'annotations-update') {
			return this._handleAnnotationsUpdate(e);
		} else if (e.data.type === 'annotations-will-change') {
			return this._handleAnnotationsWillChange(e);
		}
	}

	_onToastClose() {
		this._displayToast = false;
	}
	_postOriginalFileUrl(e, url) {
		e.source.postMessage({
			type: 'original-file',
			fileUrl: url
		}, 'https://s.brightspace.com');
	}
	_postTokenResponse(e, token) {
		e.source.postMessage({
			type: 'token-response',
			token: token
		}, 'https://s.brightspace.com');
	}

	_renderToast() {
		const toastMessage = this.localize('fileConversionWarning');
		return html`<d2l-alert-toast
			?open=${this._shouldDisplayToast()}
			@d2l-alert-toast-close=${this._onToastClose}>${toastMessage}</d2l-alert-toast>`;
	}
	_resizeEnd() {
		this._resizing = false;
	}

	_resizeStart() {
		this._resizing = true;
	}

	_shouldDisplayToast() {
		return this.fileExtension !== pdfExtension && this.displayConversionWarning && this._displayToast;
	}

}

customElements.define('d2l-consistent-evaluation-evidence-file', ConsistentEvaluationEvidenceFile);
