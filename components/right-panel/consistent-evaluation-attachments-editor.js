import 'd2l-activities/components/d2l-activity-editor/d2l-activity-attachments/d2l-activity-attachments-picker.js';
import '@d2l/d2l-attachment/components/attachment-list';
import '@d2l/d2l-attachment/components/attachment';
import { css, html, LitElement } from 'lit-element/lit-element';
import { AttachmentCollectionEntity } from 'siren-sdk/src/activities/AttachmentCollectionEntity.js';
import { AttachmentEntity } from 'siren-sdk/src/activities/AttachmentEntity.js';
import { Rels } from 'd2l-hypermedia-constants';

class ConsistentEvaluationAttachmentsEditor extends LitElement {
	static get properties() {
		return {
			href: { type: String },
			destinationHref: { type: String },
			token: { type: String },
			attachments: { type: Array }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			d2l-labs-attachment {
				margin-bottom: 20px;
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
		const tempAttachments = [];
		const entity = await window.D2L.Siren.EntityStore.fetch(href, token);
		if (entity && entity.entity && entity.entity.entities) {
			const entities = entity.entity.entities;
			for (let i = 0; i < entities.length; i++) {
				const a = await window.D2L.Siren.EntityStore.fetch(entities[i].href, token);
				tempAttachments.push(new AttachmentEntity(a.entity, token));
			}
		}
		this.attachments = tempAttachments;
	}

	async saveAttachment(e) {
		const files = e.detail.files;
		let currentHref = this.href;

		for (let i = 0; files.length > i; i++) {
			const fileSystemType = files[i].m_fileSystemType;
			const fileId = files[i].m_id;

			const attachmentsEntity = await window.D2L.Siren.EntityStore.fetch(currentHref, this.token);

			const attachmentCollectionEntity = new AttachmentCollectionEntity(attachmentsEntity.entity, this.token);
			if (!attachmentCollectionEntity.canAddAttachments()) {
				return;
			}
			await attachmentCollectionEntity.addFileAttachment(fileSystemType, fileId);

			const evaluationEntity = await window.D2L.Siren.EntityStore.get(this.destinationHref, this.token);
			currentHref = evaluationEntity.getLinkByRel(Rels.Activities.feedbackAttachments).href;
		}

		this.href = currentHref;
	}

	async removeAttachment(e) {
		const a = await window.D2L.Siren.EntityStore.fetch(e.detail, this.token);
		const attachmentEntity = new AttachmentEntity(a.entity, this.token);
		await attachmentEntity.deleteAttachment();

		const evaluationEntity = await window.D2L.Siren.EntityStore.get(this.destinationHref, this.token);
		this.href = evaluationEntity.getLinkByRel(Rels.Activities.feedbackAttachments).href;
	}

	render() {
		const a = this.attachments.map(a => {
			const attachment = {
				id: a.self(),
				name: a.name(),
				url: a.href()
			};
			const deleted = false;
			const creating = false;
			return html`<li slot="attachment" class="panel">
				<d2l-labs-attachment
					attachmentId="${a.self()}"
					.attachment="${attachment}"
					?deleted="${deleted}"
					?creating="${creating}"
					?editing="${a.canDeleteAttachment()}">
				</d2l-labs-attachment>
				</li>`;
		});

		return html`
			<d2l-labs-attachment-list
				editing="true"
				@d2l-attachment-removed="${this.removeAttachment}">
				${a}
			</d2l-labs-attachment-list>
			<d2l-activity-attachments-picker
				href="${this.href}"
				.token="${this.token}"
				@d2l-activity-attachments-picker-files-uploaded="${this.saveAttachment}"
				@d2l-activity-attachments-picker-video-uploaded="${this.saveAttachment}"
				@d2l-activity-attachments-picker-audio-uploaded="${this.saveAttachment}">
			</d2l-activity-attachments-picker>`;
	}
}
customElements.define('d2l-consistent-evaluation-attachments-editor', ConsistentEvaluationAttachmentsEditor);
