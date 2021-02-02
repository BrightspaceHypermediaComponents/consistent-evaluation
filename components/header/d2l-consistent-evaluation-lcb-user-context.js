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
			h2:focus {
				outline: none;
			}
			.d2l-user-context-container {
				align-items: center;
				display: flex;
			}
			.d2l-consistent-evaluation-user-profile-card-container {
				background: white;
				position: absolute;
				top: 3rem;
				z-index: 1;
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
		return this._showProfileCard ?
			html`
			<d2l-consistent-evaluation-user-profile-card
				display-name=${ifDefined(this._displayName)}
				tag-line="This is a tag-line that will come from the API?"
				@d2l-consistent-eval-profile-card-mouse-leave=${this._toggleOffProfileCard}>
			</d2l-consistent-evaluation-user-profile-card>
			` :
			html``;
	}

	_toggleOnProfileCard() {
		this._showProfileCard = true;
	}

	_toggleOffProfileCard() {
		this._showProfileCard = false;
	}

	render() {
		return html`
		<div class="d2l-user-context-container"
			@click=${this._toggleOnProfileCard}
			@mouseover=${this._toggleOnProfileCard}>

			${this._renderProfileImage()}
			<h2 tabindex="0" class="d2l-body-compact d2l-consistent-evaluation-lcb-user-name">${ifDefined(this._displayName)}</h2>
			${this._getExemptText()}
		</div>

		<div class="d2l-consistent-evaluation-user-profile-card-container">
			${this._renderProfileCard()}
		</div>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-user-context', ConsistentEvaluationLcbUserContext);
