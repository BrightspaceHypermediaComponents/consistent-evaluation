import '@brightspace-ui-labs/user-profile-card/user-profile-card.js';
import '@brightspace-ui/core/components/icons/icon.js';

import { html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../lang/localize-consistent-evaluation.js';

export class ConsistentEvaluationUserProfileCard extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			displayName: {
				attribute: 'display-name',
				type: String
			},
			emailHref: {
				attribute: false,
				type: String
			},
			instantMessageHref: {
				attribute: false,
				type: String
			},
			userProgressHref: {
				attribute: false,
				type: String
			},
			userProfileHref: {
				attribute: false,
				type: String
			},
			userHref: {
				attribute: false,
				type: String
			}
		};
	}

	constructor() {
		super();
		this.messagePopout = undefined;
		this.emailPopout = undefined;
	}

	_openUserProgress() {
		window.open(this.userProgressHref);
	}

	_openUserProfile() {
		if (this.userProfileHref) {
			window.open(this.userProfileHref);
		}
	}

	dispatchMouseLeaveEvent() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-eval-profile-card-mouse-leave', {
			composed: true,
			bubbles: true,
		}));
	}

	_openMessageDialog() {
		if (this.messagePopout) {
			if (!this.messagePopout.closed) {
				this.messagePopout.focus();
				return;
			}
		}

		this.messagePopout = window.open(
			this.instantMessageHref,
			'emailPopout',
			'width=400,height=200,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);
	}

	_openEmailDialog() {
		if (this.emailPopout) {
			if (!this.emailPopout.closed) {
				this.emailPopout.focus();
				return;
			}
		}

		this.emailPopout = window.open(
			this.emailHref,
			'messagePopout',
			'width=1000,height=1000,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no'
		);
	}

	_renderProfileImage() {
		return html `
			<d2l-profile-image
				slot="illustration"
				href=${this.userHref}
				.token=${this.token}
				x-large
			></d2l-profile-image>
		`;
	}

	render() {
		return html`
		<d2l-labs-user-profile-card
			@mouseleave=${this.dispatchMouseLeaveEvent}
			@d2l-labs-user-profile-card-message=${this._openMessageDialog}
			@d2l-labs-user-profile-card-email=${this._openEmailDialog}
			@d2l-labs-user-profile-card-progress=${this._openUserProgress}
			@d2l-labs-user-profile-card-profile=${this._openUserProfile}
			?show-email=${this.emailHref}
			?show-im=${this.instantMessageHref}
			?show-progress=${this.userProgressHref}
			display-name=${this.displayName}>

			${this._renderProfileImage()}
		</d2l-labs-user-profile-card>
		`;
	}
}

customElements.define('d2l-consistent-evaluation-user-profile-card', ConsistentEvaluationUserProfileCard);
