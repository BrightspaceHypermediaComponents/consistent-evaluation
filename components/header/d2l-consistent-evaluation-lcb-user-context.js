import 'd2l-users/components/d2l-profile-image.js';
import { bodyCompactStyles, bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { EntityMixinLit } from 'siren-sdk/src/mixin/entity-mixin-lit.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { loadLocalizationResources } from '../locale.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { UserEntity } from 'siren-sdk/src/users/UserEntity.js';

export class ConsistentEvaluationLcbUserContext extends EntityMixinLit(RtlMixin(LocalizeMixin(LitElement))) {

	static get properties() {
		return {
			isExempt: {
				attribute: 'is-exempt',
				type: Boolean
			},
			_displayName: {
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
		`];
	}

	static async getLocalizeResources(langs) {
		return await loadLocalizationResources(langs);
	}

	constructor() {
		super();

		this._setEntityType(UserEntity);
	}

	set _entity(entity) {
		if (this._entityHasChanged(entity)) {
			this._onUserEntityChanged(entity);
			super._entity = entity;
		}
	}

	_onUserEntityChanged(userEntity, error) {
		if (error || userEntity === null) {
			return;
		}

		this._displayName = userEntity.getDisplayName();
	}

	_getExemptText() {
		if (this.isExempt) {
			return html`<span class="d2l-body-standard d2l-consistent-evaluation-lcb-is-exempt">(${this.localize('exempt')})</span>`;
		} else {
			return null;
		}
	}

	render() {
		return html`
			<d2l-profile-image
				href="${this.href}"
				.token="${this.token}"
				small
			></d2l-profile-image>
			<span class="d2l-body-compact d2l-consistent-evaluation-lcb-user-name">${ifDefined(this._displayName)}</span>
			${this._getExemptText()}
		`;
	}
}

customElements.define('d2l-consistent-evaluation-lcb-user-context', ConsistentEvaluationLcbUserContext);
