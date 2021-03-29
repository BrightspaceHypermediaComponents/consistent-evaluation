import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown-option.js';
import './consistent-evaluation-discussion-post-page';
import { css, html, LitElement } from 'lit-element';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationEvidenceDiscussion extends SkeletonMixin(RtlMixin(LocalizeConsistentEvaluation(LitElement))) {

	static get properties() {
		return {
			discussionPostList: {
				attribute: false,
				type: Array
			},
			token: { type: Object }
		};
	}

	static get styles() {
		return css`
			.d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				float: right;
				margin-left: 1rem;
				margin-right: 1rem;
				margin-top: 1rem;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				float: left;
			}

			.d2l-consistent-evaluation-evidence-discussion-load-more {
				float: right;
				margin-left: 1rem;
				margin-right: 1rem;
				padding-bottom: 3rem;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-load-more {
				float: left;
			}


			.d2l-consistent-evaluation-no-assessable-posts-container {
				background: white;
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-assessable-posts {
				background: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}

			:host([skeleton]) .d2l-consistent-evaluation-evidence-discussion-load-more {
				display: none;
			}
		`;
	}

	render() {
		if (this.discussionPostList && this.discussionPostList.length === 0) {
			return html`${this._renderNoAssessablePosts()}`;
		}
		return html`
			${this._renderSortDropDownList()}
			${this._renderDiscussionPost()}
			${this._renderLoadMoreButton()}
		`;
	}
	_renderDiscussionPost() {
		return html`
			<d2l-consistent-evaluation-discussion-post-page
				?skeleton=${this.skeleton}
				.discussionPostList=${this.discussionPostList}
				.token=${this.token}
			></d2l-consistent-evaluation-discussion-post-page>
			`;
	}
	_renderLoadMoreButton() {
		return html`
			<d2l-button
				aria-hidden="${this.skeleton}"
				class="d2l-consistent-evaluation-evidence-discussion-load-more"
				secondary
			>${this.localize('loadMore')}</d2l-button>`;
	}
	_renderNoAssessablePosts() {
		return html`
			<div class="d2l-consistent-evaluation-no-assessable-posts-container">
				<div class="d2l-consistent-evaluation-no-assessable-posts d2l-body-standard">${this.localize('noAssessablePosts')}</div>
			</div>`;
	}

	_renderSortDropDownList() {
		return html`
			<d2l-labs-sort-by-dropdown
				class="d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown"
			>
				<d2l-labs-sort-by-dropdown-option value="date" text="Date"></d2l-labs-sort-by-dropdown-option>
			</d2l-labs-sort-by-dropdown>
			<div style="clear: both;"></div>
		`;
	}

}

customElements.define('d2l-consistent-evaluation-evidence-discussion', ConsistentEvaluationEvidenceDiscussion);
