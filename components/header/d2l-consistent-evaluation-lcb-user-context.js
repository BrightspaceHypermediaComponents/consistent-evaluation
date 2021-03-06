import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/dropdown/dropdown-context-menu.js';
import '@brightspace-ui-labs/user-profile-card/user-profile-card.js';

import { bodyCompactStyles, bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { EntityMixinLit } from 'siren-sdk/src/mixin/entity-mixin-lit.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { UserEntity } from 'siren-sdk/src/users/UserEntity.js';

export class ConsistentEvaluationLcbUserContext extends EntityMixinLit(RtlMixin(LocalizeConsistentEvaluation(LitElement))) {

	static get properties() {
		return {
			isExempt: {
				attribute: 'is-exempt',
				type: Boolean
			},
			isGroupActivity: {
				attribute: 'is-group-activity',
				type: Boolean
			},
			anonymousInfo: {
				attribute: false,
				type: Object
			},
			enrolledUserHref: {
				attribute: 'enrolled-user-href',
				type: String
			},
			userProgressAssessmentsHref: {
				attribute: 'user-progress-assessments-href',
				type: String
			},
			groupInfo: {
				attribute: false,
				type: Object
			},
			_displayName: {
				attribute: false,
				type: String
			},
			_groupEmailItemID: {
				attribute: false,
				type: String
			},
			_groupIMItemID: {
				attribute: false,
				type: String
			},
			_groupMembersItemID: {
				attribute: false,
				type: String
			}
		};
	}

	static get styles() {
		return [bodyCompactStyles, bodyStandardStyles, css`
			:host {
				align-items: center;
				display: flex;
			}
			.d2l-consistent-evaluation-lcb-user-name {
				margin-left: 0.5rem;
				max-width: 10rem;
				min-width: 2rem;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-lcb-user-name {
				margin-left: 0;
				margin-right: 0.5rem;
			}
			.d2l-consistent-evaluation-lcb-is-exempt {
				font-style: italic;
				margin-left: 0.5rem;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-lcb-is-exempt {
				margin-left: 0;
				margin-right: 0.5rem;
			}
			.d2l-user-context-container:focus {
				outline: none;
			}
			.d2l-user-context-container {
				align-items: center;
				display: flex;
			}
			.d2l-user-group-context-menu {
				padding-left: 0.25rem;
			}
		`];
	}

	constructor() {
		super();
		this.messagePopout = undefined;
		this.emailPopout = undefined;
		this._setEntityType(UserEntity);
	}

	firstUpdated() {
		this._groupEmailItemID = getUniqueId();
		this._groupIMItemID = getUniqueId();
		this._groupMembersItemID = getUniqueId();
	}

	render() {
		return html`
		<div class="d2l-user-context-container"
			tabindex="0"
			aria-label=${ifDefined(this._displayName)}>

			${this._renderProfileImage()}
			<h2 class="d2l-body-compact d2l-consistent-evaluation-lcb-user-name" title="${ifDefined(this._displayName)}">${ifDefined(this._displayName)}</h2>
			${this._getExemptText()}
			${this._renderGroupOptions()}

		</div>
		`;
	}
	set _entity(entity) {
		if (this._entityHasChanged(entity)) {
			this._onActorEntityChanged(entity);
			super._entity = entity;
		}
	}

	_getExemptText() {
		if (this.isExempt) {
			return html`<span class="d2l-body-standard d2l-consistent-evaluation-lcb-is-exempt">(${this.localize('exempt')})</span>`;
		} else {
			return null;
		}
	}
	_onActorEntityChanged(actorEntity, error) {
		if (error || actorEntity === null) {
			return;
		}

		this._displayName = actorEntity.getDisplayName();
	}

	_onGroupOptionSelect(e) {
		switch (e.target.id) {
			case this._groupEmailItemID:
				this._openGroupEmail();
				break;
			case this._groupMembersItemID:
				this._openGroupMembers();
				break;
			case this._groupIMItemID:
				this._openGroupIM();
				break;
		}
	}
	_openGroupEmail() {
		if (this.emailPopout) {
			if (!this.emailPopout.closed) {
				this.emailPopout.focus();
				return;
			}
		}
		const emailPath = this.groupInfo ? this.groupInfo.emailPath : undefined;

		if (!emailPath) {
			this.logger.log('Consistent-Eval: Expected emailPath for groups, but none found');
			return;
		}

		this.emailPopout = window.open(
			emailPath,
			'emailPopout',
			'width=1000,height=1000,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);
	}

	_openGroupIM() {
		if (this.messagePopout) {
			if (!this.messagePopout.closed) {
				this.messagePopout.focus();
				return;
			}
		}
		const pagerPath = this.groupInfo ? this.groupInfo.pagerPath : undefined;

		if (!pagerPath) {
			this.logger.log('Consistent-Eval: Expected pagerPath for groups, but none found');
			return;
		}

		this.messagePopout = window.open(
			pagerPath,
			'messagePopout',
			'width=400,height=200,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);
	}

	_openGroupMembers() {
		const viewMembersPath = this.groupInfo ? this.groupInfo.viewMembersPath : undefined;

		if (!viewMembersPath) {
			this.logger.log('Consistent-Eval: Expected view-members item dialog URL, but none found');
			return;
		}

		const location = new D2L.LP.Web.Http.UrlLocation(viewMembersPath);

		const buttons = [
			{
				Text: this.localize('closeBtn'),
				ResponseType: 1, // D2L.Dialog.ResponseType.Positive
				IsPrimary: true,
				IsEnabled: true
			}
		];

		D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
			/*               opener: */ this.shadowRoot.querySelector('d2l-menu-item'),
			/*             location: */ location,
			/*          srcCallback: */ 'SrcCallback',
			/*       resizeCallback: */ '',
			/*      responseDataKey: */ 'result',
			/*                width: */ 500,
			/*               height: */ 800,
			/*            closeText: */ this.localize('closeBtn'),
			/*              buttons: */ buttons,
			/* forceTriggerOnCancel: */ false,
			/* 			 	  title: */ this.localize('groupMembers', { groupName: this._displayName })
		);
	}

	_renderGroupOptions() {
		return (this.isGroupActivity && this.groupInfo) ? html`
			<d2l-dropdown-context-menu class="d2l-user-group-context-menu" text=${this.localize('openGroupOptions')}>
				<d2l-dropdown-menu>
					<d2l-menu @d2l-menu-item-select=${this._onGroupOptionSelect} label=${this.localize('groupOptions')}>
						<d2l-menu-item id=${this._groupEmailItemID} text=${this.localize('emailGroup')} ?hidden=${!this.groupInfo.emailPath}></d2l-menu-item>
						<d2l-menu-item id=${this._groupMembersItemID} text=${this.localize('seeAllGroupMembers')} ?hidden=${!this.groupInfo.viewMembersPath}></d2l-menu-item>
						<d2l-menu-item id=${this._groupIMItemID} text=${this.localize('instantMessage')} ?hidden=${!this.groupInfo.pagerPath}></d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-context-menu>
			` :
			html``;
	}
	_renderProfileImage() {
		if (this.isGroupActivity) {
			return html``;
		} else if (this.anonymousInfo && this.anonymousInfo.isAnonymous && !this.anonymousInfo.assignmentHasPublishedSubmission) {
			return html`<d2l-profile-image
				href=${this.href}
				.token=${this.token}
				small
			></d2l-profile-image>`;
		} else if (this.enrolledUserHref) {
			return html `
			<d2l-labs-user-profile-card
				href=${this.enrolledUserHref}
				user-progress-href=${ifDefined(this.userProgressAssessmentsHref)}
				.token=${this.token}
				small-opener>
			</d2l-labs-user-profile-card>`;
		}
	}

}

customElements.define('d2l-consistent-evaluation-lcb-user-context', ConsistentEvaluationLcbUserContext);
