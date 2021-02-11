import '@brightspace-ui/core/components/dialog/dialog-confirm.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import { html, LitElement } from 'lit-element/lit-element.js';
import { ConsistentEvaluationController } from './controllers/ConsistentEvaluationController.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { LocalizeConsistentEvaluation } from '../lang/localize-consistent-evaluation.js';

const DIALOG_ACTION_LEAVE = 'leave';
const DIALOG_ACTION_PUBLISH_OR_UPDATE = 'publish_or_update';
const UNSAVED_CHANGES_DIALOG = 'unsavedChanges';
const PUBLISH_UNSCORED_DIALOG = 'publishUnscored';
const UPDATE_UNSCORED_DIALOG = 'updateUnscored';
const UNSCORED_DIALOG_WIDTH = 464;

export class ConsistentEvaluationDialogs extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			href: {
				attribute: 'href',
				type: String
			},
			evaluationHref: {
				attribute: 'evaluation-href',
				type: String
			},
			navigationTarget: {
				attribute: false,
				type: String,
			},
			publishClicked: {
				attribute: false,
				type: Boolean
			},
			updateClicked: {
				attribute: false,
				type: Boolean
			},
			token: {
				attribute: false,
				type: Object
			},
			_dialogToOpen: {
				attribute: false,
				type: String
			},
			_unscoredCriteriaDialogOpened: {
				type: Boolean,
				attribute: false
			},
			_unsavedChangesDialogOpened: {
				type: Boolean,
				attribute: false
			}
		};
	}

	constructor() {
		super();
		this._token = undefined;
		this.publishClicked = false;
		this.updateClicked = false;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('publishClicked') && this.publishClicked) {
			this._dialogToOpen = PUBLISH_UNSCORED_DIALOG;
			this._showUnscoredCriteriaDialog();
		} else if (changedProperties.has('updateClicked') && this.updateClicked) {
			this._dialogToOpen = UPDATE_UNSCORED_DIALOG;
			this._showUnscoredCriteriaDialog();
		} else if (changedProperties.has('navigationTarget') && this.navigationTarget) {
			this._dialogToOpen = UNSAVED_CHANGES_DIALOG;
			this._showUnsavedChangesDialog();
		}
	}

	async _showUnscoredCriteriaDialog() {
		const hasUnscoredCriteria = await this._checkUnscoredCriteria();
		if (hasUnscoredCriteria) {
			this._unscoredCriteriaDialogOpened = true;
			return;
		}

		this._updateOrPublishEvaluation();
	}

	async _showUnsavedChangesDialog() {
		const controller = new ConsistentEvaluationController(this.evaluationHref, this.token);
		const entity = await controller.fetchEvaluationEntity(false);
		if (entity.hasClass('unsaved')) {
			this._unsavedChangesDialogOpened = true;
		} else {
			this._fireNavigateEvent();
		}
	}

	async _checkUnscoredCriteria() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		const _rubricsInfo = await controller.getRubricInfos(true);
		const hasUnscoredCriteria = _rubricsInfo.find(rubric => rubric.hasUnscoredCriteria) !== undefined;
		return hasUnscoredCriteria;
	}

	_onUnscoredCriteriaDialogClosed(e) {
		this._unscoredCriteriaDialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_PUBLISH_OR_UPDATE) {
			this._updateOrPublishEvaluation();
		} else {
			this._fireDialogClosedEvent();
		}
	}

	_updateOrPublishEvaluation() {
		if (this._dialogToOpen === PUBLISH_UNSCORED_DIALOG) {
			this._firePublishEvaluationEvent();
		} else if (this._dialogToOpen === UPDATE_UNSCORED_DIALOG) {
			this._fireUpdateEvaluationEvent();
		}
	}

	_onUnsavedChangesDialogClose(e) {
		this._unsavedChangesDialogOpened = false;
		if (e.detail.action === DIALOG_ACTION_LEAVE) {
			this._fireNavigateEvent();
		} else {
			this._fireDialogClosedEvent();
		}
	}

	async _fireNavigateEvent() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-navigate', {
			composed: true,
			bubbles: true
		}));
		this._fireDialogClosedEvent();
	}

	async _fireUpdateEvaluationEvent() {
		this.dispatchEvent(new CustomEvent('d2l-update-evaluation', {
			composed: true,
			bubbles: true
		}));
	}

	async _firePublishEvaluationEvent() {
		this.dispatchEvent(new CustomEvent('d2l-publish-evaluation', {
			composed: true,
			bubbles: true
		}));
	}

	async _fireDialogClosedEvent() {
		this.dispatchEvent(new CustomEvent('d2l-dialog-closed', {
			composed: true,
			bubbles: true
		}));
	}
	_renderUnsavedChanges() {
		return html`
			<d2l-dialog-confirm
				title-text=${this.localize('unsavedChangesTitle')}
				text=${this.localize('unsavedChangesBody')}
				?opened=${this._unsavedChangesDialogOpened}
				@d2l-dialog-close=${this._onUnsavedChangesDialogClose}>
					<d2l-button slot="footer" primary data-dialog-action=${DIALOG_ACTION_LEAVE}>${this.localize('leaveBtn')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action>${this.localize('cancelBtn')}</d2l-button>
			</d2l-dialog-confirm>`;
	}

	_renderUnscoredCriteria() {
		return html`<d2l-dialog
				title-text=${this.localize('unscoredCriteriaTitle')}
				?opened=${this._unscoredCriteriaDialogOpened}
				width=${UNSCORED_DIALOG_WIDTH}
				@d2l-dialog-close=${this._onUnscoredCriteriaDialogClosed}>
					<div>${this.localize('unscoredCriteriaBody')}</div>
					<d2l-button slot="footer" primary data-dialog-action>${this.localize('continueGrading')}</d2l-button>
					<d2l-button slot="footer" data-dialog-action=${DIALOG_ACTION_PUBLISH_OR_UPDATE}>${this.localize('publishAnyway')}</d2l-button>
			</d2l-dialog>`;
	}

	render() {
		if (this._dialogToOpen === UNSAVED_CHANGES_DIALOG) {
			return this._renderUnsavedChanges();
		} else if (this._dialogToOpen === PUBLISH_UNSCORED_DIALOG || this._dialogToOpen === UPDATE_UNSCORED_DIALOG) {
			return this._renderUnscoredCriteria();
		}
	}
}

customElements.define('d2l-consistent-evaluation-dialogs', ConsistentEvaluationDialogs);
