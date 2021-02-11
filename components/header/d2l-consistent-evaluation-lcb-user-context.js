import 'd2l-users/components/d2l-profile-image.js';
import './consistent-evaluation-user-profile-card.js';
import { bodyCompactStyles, bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { EntityMixinLit } from 'siren-sdk/src/mixin/entity-mixin-lit.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';
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
			enrolledUser: {
				attribute: false,
				type: Object
			},
			_displayName: {
				attribute: false,
				type: String
			},
			_showProfileCard: {
				attribute: false,
				type: Boolean
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
			.d2l-consistent-evaluation-user-profile-card-container {
				position: absolute;
				top: 4rem;
				z-index: 1;
			}
			d2l-consistent-evaluation-user-profile-card {
				position: relative;
				top: 1.75rem;
			}
		`];
	}

	constructor() {
		super();

		this._setEntityType(UserEntity);
	}

	set _entity(entity) {
		if (this._entityHasChanged(entity)) {
			this._onActorEntityChanged(entity);
			super._entity = entity;
		}
	}

	_onActorEntityChanged(actorEntity, error) {
		if (error || actorEntity === null) {
			return;
		}

		this._displayName = actorEntity.getDisplayName();
	}

	_getExemptText() {
		if (this.isExempt) {
			return html`<span class="d2l-body-standard d2l-consistent-evaluation-lcb-is-exempt">(${this.localize('exempt')})</span>`;
		} else {
			return null;
		}
	}

	_renderProfileImage() {
		if (this.isGroupActivity) {
			return html``;
		} else {
			return html `
			<d2l-profile-image
				href=${this.href}
				.token=${this.token}
				small
			></d2l-profile-image>`;
		}
	}

	_renderProfileCard() {
		let emailHref = undefined;
		let instantMessageHref = undefined;
		let userProgressHref = undefined;
		let userProfileHref = undefined;
		let displayName = undefined;
		if (this.enrolledUser) {
			emailHref = this.enrolledUser.emailPath;
			instantMessageHref = this.enrolledUser.pagerPath;
			userProgressHref = this.enrolledUser.userProgressPath;
			userProfileHref = this.enrolledUser.userProfilePath;
			displayName = this.enrolledUser.displayName;
		}

		return (this._showProfileCard && !this.isGroupActivity) ?
			html`
			<d2l-consistent-evaluation-user-profile-card
				.token=${this.token}
				display-name=${displayName}
				.emailHref=${emailHref}
				.instantMessageHref=${instantMessageHref}
				.userProgressHref=${userProgressHref}
				.userProfileHref=${userProfileHref}
				.userHref=${this.href}
				@d2l-consistent-eval-profile-card-mouse-leave=${this._toggleOffProfileCard}>
			</d2l-consistent-evaluation-user-profile-card>
			` :
			html``;
	}

	_toggleOnProfileCard() {
		this._showProfileCard = true;
	}

	_toggleOffProfileCard(event) {
		//Don't close/flciker the profile card when mousing off of it and onto the user-context-container
		if (event.type !== 'd2l-consistent-eval-profile-card-mouse-leave') {
			this._showProfileCard = false;
		}
	}

	render() {
		return html`
		<div class="d2l-user-context-container"
			tabindex="0"
			aria-label=${ifDefined(this._displayName)}
			@mouseover=${this._toggleOnProfileCard}
			@mouseleave=${this._toggleOffProfileCard}>

			${this._renderProfileImage()}
			<h2 class="d2l-body-compact d2l-consistent-evaluation-lcb-user-name">${ifDefined(this._displayName)}</h2>
			${this._getExemptText()}
			<div class="d2l-consistent-evaluation-user-profile-card-container" @click=${this._toggleOffProfileCard}>
				${this._renderProfileCard()}
			</div>
		</div>

		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-user-context', ConsistentEvaluationLcbUserContext);
