/* global moment:false */
import 'd2l-polymer-siren-behaviors/store/entity-store.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import { appId, submissions } from '../controllers/constants';
import { css, html, LitElement } from 'lit-element';
import { findFile, getSubmissionFiles, getSubmissions } from '../helpers/submissionsAndFilesHelpers.js';
import { createClient } from '@brightspace-ui/logging';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

export class ConsistentEvaluationLcbFileContext extends RtlMixin(LocalizeConsistentEvaluation(LitElement)) {

	static get properties() {
		return {
			submissionInfo: {
				attribute: false,
				type: Object
			},
			_files: {
				attribute: false,
				type: Array
			},
			specialAccessHref: {
				attribute: 'special-access-href',
				type: String
			},
			_submissionLateness: {
				attribute: false,
				type: Number
			},
			currentFileId: {
				type: String
			}
		};
	}

	static get styles() {
		return [selectStyles,
			css`
				:host {
					align-items: center;
					display: flex;
					margin-left: 0.7rem;
				}
				.d2l-input-select {
					max-width: 15rem;
				}
				:host([dir="rtl"]) {
					margin-left: 0;
					margin-right: 0.7rem;
				}
				.d2l-truncate {
					overflow: hidden;
					overflow-wrap: break-word;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				@media (max-width: 930px) {
					:host {
						display: none;
					}
				}
			`
		];
	}
	constructor() {
		super();
		this.logger = createClient(appId);
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (changedProperties.has('submissionInfo')) {
			this._files = await getSubmissions(this.submissionInfo, this.token);
		}

		if ((changedProperties.has('currentFileId') || changedProperties.has('submissionInfo')) && this._files) {
			const currentFile = findFile(this.currentFileId, this._files);
			if (currentFile && currentFile.properties) {
				this._submissionLateness = currentFile.properties.latenessTimespan;
			}
		}
	}

	_onSelectChange(e) {
		if (e.target.value === submissions) {
			this.dispatchEvent(new Event('d2l-consistent-evaluation-evidence-back-to-user-submissions', {
				composed: true,
				bubbles: true
			}));
		} else {
			const fileId = e.target.value;
			this._dispatchFileSelectedEvent(fileId);
		}
	}

	_dispatchFileSelectedEvent(fileId) {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-file-selected', {
			detail: {
				fileId: fileId
			},
			composed: true,
			bubbles: true
		}));
	}

	_renderLateButton() {
		if (!this.currentFileId || !this._submissionLateness)
		{
			return html``;
		} else {
			return html`
				<d2l-button-subtle
					text="${moment.duration(Number(this._submissionLateness), 'seconds').humanize()} ${this.localize('late')}"
					icon="tier1:access-special"
					@click="${this._openSpecialAccessDialog}"
				></d2l-button-subtle>`;
		}
	}

	_openSpecialAccessDialog() {
		const specialAccess = this.specialAccessHref;

		if (!specialAccess) {
			this.logger.log('Consistent-Eval: Expected special access item dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(specialAccess);

		const buttons = [
			{
				Key: 'save',
				Text: this.localize('saveBtn'),
				ResponseType: 1, // D2L.Dialog.ResponseType.Positive
				IsPrimary: true,
				IsEnabled: true
			},
			{
				Text: this.localize('cancelBtn'),
				ResponseType: 2, // D2L.Dialog.ResponseType.Negative
				IsPrimary: false,
				IsEnabled: true
			}
		];

		D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
			/*               opener: */ this.shadowRoot.querySelector('d2l-button-subtle'),
			/*             location: */ location,
			/*          srcCallback: */ 'SrcCallback',
			/*       resizeCallback: */ '',
			/*      responseDataKey: */ 'result',
			/*                width: */ 1920,
			/*               height: */ 1080,
			/*            closeText: */ this.localize('closeBtn'),
			/*              buttons: */ buttons,
			/* forceTriggerOnCancel: */ false
		);
	}

	_truncateFileName(fileName) {
		const maxFileLength = 50;
		if (fileName.length <= maxFileLength) {
			return fileName;
		}

		const ext = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
		return  `${fileName.substring(0, maxFileLength)}…${ext}`;
	}

	refreshSelect() {
		this.shadowRoot.querySelector('select').value = this.currentFileId;
	}

	render() {
		if (!this._files || this._files.length === 0) {
			return html ``;
		}

		return html`
			<select class="d2l-input-select d2l-truncate" aria-label=${this.localize('userSubmissions')} @change=${this._onSelectChange}>
				<option label=${this.localize('userSubmissions')} value=${submissions} ?selected=${!this.currentFileId}></option>
				${this._files.map(submission => html`
					<optgroup label=${this.localize('submissionNumber', 'number', submission.submissionNumber)}>
						${getSubmissionFiles(submission).map(sf => html`
							<option value=${sf.properties.id} label=${this._truncateFileName(sf.properties.name)} ?selected=${sf.properties.id === this.currentFileId} class="select-option"></option>
						`)}
					</optgroup>
				`)};
			</select>
			${this._renderLateButton()}
 		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-file-context', ConsistentEvaluationLcbFileContext);
