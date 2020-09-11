import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-picker.js';
import '@d2l/d2l-attachment/components/attachment-list';
import '@d2l/d2l-attachment/components/attachment';
import { css, html, LitElement } from 'lit-element/lit-element';
import { AttachmentEntity } from 'siren-sdk/src/activities/AttachmentEntity.js';

class ConsistentEvaluationAttachmentsEditor extends LitElement {
	static get properties() {
		return {
			href: { type: String },
			token: { type: String },
			attachments: { type: Array }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
		`;
	}

	constructor() {
		super();
		this.attachments = [];
	}

	get href() {
		return this._href;
	}

	set href(val) {
		const oldVal = this.href;
		if (oldVal !== val) {
			this._href = val;
			if (this._href && this._token) {
				this._init(this._href, this._token).then(() => this.requestUpdate());
			}
		}
	}

	get token() {
		return this._token;
	}

	set token(val) {
		const oldVal = this.token;
		if (oldVal !== val) {
			this._token = val;
			if (this._href && this._token) {
				this._init(this._href, this._token).then(() => this.requestUpdate());
			}
		}
	}

	async _init(href, token) {
		const entity = await window.D2L.Siren.EntityStore.fetch(href, token);
		if (entity && entity.entity && entity.entity.entities) {
			const entities = entity.entity.entities;
			for (let i = 0; i < entities.length; i++) {
				const a = await window.D2L.Siren.EntityStore.fetch(entities[i].href, token);
				this.attachments.push(new AttachmentEntity(a.entity, token));
			}
		}
	}

	render() {
		const a = this.attachments.map(a => {
			const attachment = {
				id: a.self(),
				name: a.name(),
				url: a.href()
			};
			return html`<li slot="attachment" class="panel">
				<d2l-labs-attachment
					attachmentId="${a.self()}"
					.attachment="${attachment}"
					deleted="false"
					creating="false"
					?editing="${a.canDeleteAttachment()}">
				</d2l-labs-attachment>
				</li>`;
		});

		return html`
			<d2l-labs-attachment-list editing="true">
				${a}
			</d2l-labs-attachment-list>
			<d2l-activity-attachments-picker
				href="${this.href}"
				.token="${this.token}">
			</d2l-activity-attachments-picker>`;
	}
}
customElements.define('d2l-consistent-evaluation-attachments-editor', ConsistentEvaluationAttachmentsEditor);
