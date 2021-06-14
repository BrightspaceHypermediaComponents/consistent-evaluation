import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown-option.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown-category.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown-option.js';
import './consistent-evaluation-discussion-post-page';
import { css, html, LitElement } from 'lit-element';
import { filterByReplies, filterByScored, filterByThreads, filterByUnscored, sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../../controllers/constants';
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
			discussionTopicLink: {
				attribute: 'discussion-topic-link',
				type: String
			},
			token: { type: Object },
			_sortingMethod: {
				attribute: false,
				type: String
			},
			_selectedPostFilters: {
				attribute: false,
				type: Array
			},
			_selectedScoreFilters: {
				attribute: false,
				type: Array
			}
		};
	}

	static get styles() {
		return css`
			.d2l-consistent-evaluation-evidence-discussion-list-modifiers {
				display: flex;
				justify-content: flex-end;
			}

			.d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				margin-left: 1rem;
				margin-right: 1rem;
				margin-top: 1rem;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown {
				margin-right: 0;
			}

			.d2l-consistent-evaluation-evidence-discussion-filter-by-dropdown {
				margin-top: 1rem;
			}
			:host([dir="rtl"]) .d2l-consistent-evaluation-evidence-discussion-filter-by-dropdown {
				margin-left: 1rem;
			}

			.d2l-consistent-evaluation-no-assessable-posts-padding {
				display: inline-block;
				width: 100%;
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
		`;
	}
	constructor() {
		super();
		this._sortingMethod = sortByOldestFirst;
		this._selectedPostFilters = [];
		this._selectedScoreFilters = [];
	}

	render() {
		if (this.discussionPostList && this.discussionPostList.length === 0 && !this.skeleton) {
			this._finishedLoading();
			return html`${this._renderNoAssessablePosts()}`;
		}
		return html`
		<d2l-labs-filter-dropdown id="filter" total-selected-option-count="4">
			<d2l-labs-filter-dropdown-category key="1" category-text="Category 1">
				<d2l-labs-filter-dropdown-option selected text="Option 1 - 1 test test test test test test test test test test test test test test test test test test" value="1"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 1 - 2" value="2"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option selected text="Option 1 - 3" value="3"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option selected text="Option 1 - 4" value="4"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 1 - 5" value="5"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 1 - 6" value="6"></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>
			<d2l-labs-filter-dropdown-category key="2" category-text="Category 2">
				<d2l-labs-filter-dropdown-option selected text="Option 2 - 1" value="1"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 2 - 2" value="2"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 2 - 3" value="3"></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>
			<d2l-labs-filter-dropdown-category key="3" category-text="Category 3">
				<d2l-labs-filter-dropdown-option text="Option 3 - 1" value="1"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 3 - 2" value="2"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 3 - 3" value="3"></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>
			<d2l-labs-filter-dropdown-category key="4" category-text="Category 4">
				<d2l-labs-filter-dropdown-option text="Option 4 - 1" value="1"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 4 - 2" value="2"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 4 - 3" value="3"></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>
			<d2l-labs-filter-dropdown-category key="5" category-text="Category 5" disable-search>
				<d2l-labs-filter-dropdown-option text="Option 5 - 1" value="1"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 5 - 2" value="2"></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option text="Option 5 - 3" value="3"></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>
		</d2l-labs-filter-dropdown>
		<d2l-labs-filter-dropdown id="hello" total-selected-option-count="4">
		</d2l-labs-filter-dropdown>
		`;
	}
	async updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('discussionTopicLink')) {
			this._clearFilters();
		}
	}
	_clearFilters() {
		this._selectedPostFilters = [];
		this._selectedScoreFilters = [];
	}
	_finishedLoading() {
		this.dispatchEvent(new CustomEvent('d2l-consistent-evaluation-loading-finished', {
			composed: true,
			bubbles: true,
			detail: {
				component: 'discussions'
			}
		}));
	}

	_renderDiscussionPost() {
		return html`
			<d2l-consistent-evaluation-discussion-post-page
				sorting-method=${this._sortingMethod}
				.selectedPostFilters=${this._selectedPostFilters}
				.selectedScoreFilters=${this._selectedScoreFilters}
				?skeleton=${this.skeleton}
				.discussionPostList=${this.discussionPostList}
				.token=${this.token}
			></d2l-consistent-evaluation-discussion-post-page>
		`;
	}
	_renderFilterDropDownList() {
		return html`
			<d2l-labs-filter-dropdown
				class="d2l-consistent-evaluation-evidence-discussion-filter-by-dropdown"
				total-selected-option-count=${this._selectedPostFilters.length + this._selectedScoreFilters.length}
				min-width="200"
				@d2l-labs-filter-dropdown-cleared=${this._clearFilters}
			>
				${this._renderPostFilters()}
				${this._renderScoreFilters()}
			</d2l-labs-filter-dropdown>
			<div style="clear: both;"></div>
		`;
	}
	_renderListModifiers() {
		return html`
			<div class="d2l-consistent-evaluation-evidence-discussion-list-modifiers">
				${this._renderFilterDropDownList()}
				${this._renderSortDropDownList()}
			</div>`;
	}
	_renderNoAssessablePosts() {
		return html`
			<div class="d2l-consistent-evaluation-no-assessable-posts-padding">
				<div class="d2l-consistent-evaluation-no-assessable-posts-container">
					<div class="d2l-consistent-evaluation-no-assessable-posts d2l-body-standard">${this.localize('noAssessablePosts')}</div>
				</div>
			</div>`;
	}
	_renderPostFilters() {
		return html `<d2l-labs-filter-dropdown-category
				category-text=${this.localize('posts')}
				selected-option-count=${this._selectedPostFilters.length}
				disable-search
				@d2l-labs-filter-dropdown-option-change=${this._setPostsFilter}
			>
				<d2l-labs-filter-dropdown-option
					value=${filterByThreads}
					text=${this.localize('threads')}
					?selected=${this._selectedPostFilters.includes(filterByThreads)}
				></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option
					value=${filterByReplies}
					text=${this.localize('replies')}
					?selected=${this._selectedPostFilters.includes(filterByReplies)}
				></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>`;
	}

	_renderScoreFilters() {
		if (this.discussionPostList && this.discussionPostList.some(postEntity => postEntity.properties && postEntity.properties.outOf)) {
			return html`<d2l-labs-filter-dropdown-category
					category-text=${this.localize('score')}
					selected-option-count=${this._selectedScoreFilters.length}
					disable-search
					@d2l-labs-filter-dropdown-option-change=${this._setScoredFilter}
				>
					<d2l-labs-filter-dropdown-option
						value=${filterByUnscored}
						text=${this.localize('unscored')}
						?selected=${this._selectedScoreFilters.includes(filterByUnscored)}
					></d2l-labs-filter-dropdown-option>
					<d2l-labs-filter-dropdown-option
						value=${filterByScored}
						text=${this.localize('scored')}
						?selected=${this._selectedScoreFilters.includes(filterByScored)}
					></d2l-labs-filter-dropdown-option>
				</d2l-labs-filter-dropdown-category>`;
		} else {
			return html ``;
		}
	}

	_renderSortDropDownList() {
		return html`
			<d2l-labs-sort-by-dropdown
				class="d2l-consistent-evaluation-evidence-discussion-sort-by-dropdown"
				@d2l-labs-sort-by-dropdown-change=${this._setSort}
			>
				<d2l-labs-sort-by-dropdown-option value=${sortByOldestFirst} text=${this.localize('oldestFirst')} ?selected=${this._sortingMethod === sortByOldestFirst}></d2l-labs-sort-by-dropdown-option>
				<d2l-labs-sort-by-dropdown-option value=${sortByNewestFirst} text=${this.localize('newestFirst')} ?selected=${this._sortingMethod === sortByNewestFirst}></d2l-labs-sort-by-dropdown-option>
				<d2l-labs-sort-by-dropdown-option value=${sortBySubject} text=${this.localize('postSubject')} ?selected=${this._sortingMethod === sortBySubject}></d2l-labs-sort-by-dropdown-option>
			</d2l-labs-sort-by-dropdown>
		`;
	}

	_setPostsFilter(e) {
		const newFilters = [...this._selectedPostFilters];
		const newFilter = e.detail.menuItemKey;
		const indexOfFilter = newFilters.indexOf(newFilter);
		if (indexOfFilter >= 0) {
			newFilters.splice(indexOfFilter, 1);
		} else {
			newFilters.push(newFilter);
		}
		this._selectedPostFilters = newFilters;
	}
	_setScoredFilter(e) {
		const newFilters = [...this._selectedScoreFilters];
		const newFilter = e.detail.menuItemKey;
		const indexOfFilter = newFilters.indexOf(newFilter);
		if (indexOfFilter >= 0) {
			newFilters.splice(indexOfFilter, 1);
		} else {
			newFilters.push(newFilter);
		}
		this._selectedScoreFilters = newFilters;
	}

	_setSort(e) {
		this._sortingMethod = e.detail.value;
	}

}

customElements.define('d2l-consistent-evaluation-evidence-discussion', ConsistentEvaluationEvidenceDiscussion);
