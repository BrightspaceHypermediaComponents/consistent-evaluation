import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/sort-by-dropdown/sort-by-dropdown-option.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown-category.js';
import '@brightspace-ui-labs/facet-filter-sort/components/filter-dropdown/filter-dropdown-option.js';
import './consistent-evaluation-discussion-post-page';
import { attachmentClassName, attachmentListClassName, fivestarRatingClass, lmsSourceRel, upvoteDownvoteRatingClass, upvoteOnlyRatingClass } from '../../controllers/constants.js';
import { Classes, Rels } from 'd2l-hypermedia-constants';
import { css, html, LitElement } from 'lit-element';
import { filterByReplies, filterByScored, filterByThreads, filterByUnscored, sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../../controllers/constants';
import { filterDiscussionPosts, sortDiscussionPosts } from '../../helpers/discussionPostsHelper.js';
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
			_displayedDiscussionPostObjects: {
				attribute: false,
				type: Array
			},
			_filteringStatus: {
				attribute: false,
				type: String
			},
			_selectedFilters: {
				attribute: false,
				type: Array
			},
			_sortingMethod: {
				attribute: false,
				type: String
			},
			_ratingMethod: {
				attribute: false,
				type: String
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
		this._selectedFilters = [];
		this._filteringStatus = '';
		this._ratingMethod = '';
	}

	get token() {
		return this._token;
	}

	set token(val) {
		this._token = val;
	}

	render() {

		if (this.discussionPostList && typeof this._displayedDiscussionPostObjects === 'undefined') {
			this._getDiscussionPostEntities().then(() => {
				this.requestUpdate();
				return html`
					${this._renderListModifiers()}
					${this._renderDiscussionPost()}
				`;
			});
		} else {
			return html`
				${this._renderListModifiers()}
				${this._renderDiscussionPost()}
			`;
		}

		if (this.discussionPostList && this.discussionPostList.length === 0 && !this.skeleton) {
			this._finishedLoading();
			return html`${this._renderNoAssessablePosts()}`;
		}
	}

	async updated(changedProperties) {
		super.updated(changedProperties);
		if (changedProperties.has('discussionTopicLink')) {
			this._clearFilters();
		}
		if (changedProperties.has('skeleton')) {
			// on student change or page reload, reset variable to prompt refiltering/sorting of posts
			this._displayedDiscussionPostObjects = undefined;
		}
	}

	_clearFilters() {
		this._selectedFilters = [];
		this._displayedDiscussionPostObjects = undefined;
	}

	_countPostFilters() {
		return this._selectedFilters.includes(filterByThreads) + this._selectedFilters.includes(filterByReplies);
	}

	_countScoreFilters() {
		return this._selectedFilters.includes(filterByUnscored) + this._selectedFilters.includes(filterByScored);
	}

	_filterPosts(e) {
		const newFilters = [...this._selectedFilters];
		const newFilter = e.detail.menuItemKey;
		const indexOfFilter = newFilters.indexOf(newFilter);
		if (indexOfFilter >= 0) {
			newFilters.splice(indexOfFilter, 1);
		} else {
			newFilters.push(newFilter);
		}
		this._selectedFilters = newFilters;
		this._filteringStatus = '';
		this._getDiscussionPostEntities().then(() => {
			if (this._displayedDiscussionPostObjects.length > 0) {
				this._filteringStatus = this.localize('filteringComplete');
			} else {
				this._filteringStatus = this.localize('noPostsInFilteredRange');
			}
			this.requestUpdate();
		});
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

	async _formatDiscussionPostObject(discussionPostEntity, discussionPostEvaluationEntity) {
		const postHref = discussionPostEntity.getLinkByRel(lmsSourceRel).href;
		const postTitle = discussionPostEntity.properties.subject;
		const postBody = discussionPostEntity.properties.message;
		const ratingInformation = this._formatDiscussionRatings(discussionPostEntity);
		const isUnscored = discussionPostEvaluationEntity.properties ? discussionPostEvaluationEntity.properties.score === null : false;
		const wordCount = discussionPostEntity.properties.wordCount;

		let createdDate = undefined;
		let createdDateString = undefined;
		if (discussionPostEntity.hasSubEntityByClass(Classes.assignments.date)) {
			createdDateString = discussionPostEntity.getSubEntityByClass(Classes.assignments.date).properties.date;
			createdDate = new Date(createdDateString);
		} else {
			console.warn('Consistent Evaluation discussion post date not found');
		}

		let threadTitle = undefined;
		let isReply = false;
		if (discussionPostEntity.hasLinkByRel(Rels.Discussions.thread)) {
			isReply = true;
			const threadHref = discussionPostEntity.getLinkByRel(Rels.Discussions.thread).href;
			const threadEntity = await this._getDiscussionPostEntity(threadHref);
			if (threadEntity && threadEntity.entity) {
				threadTitle = threadEntity.entity.properties.subject;
			}
		}

		let attachmentList = undefined;
		if (discussionPostEntity.hasSubEntityByClass(attachmentListClassName)) {
			const attachmentListEntity = discussionPostEntity.getSubEntityByClass(attachmentListClassName);
			attachmentList = attachmentListEntity.getSubEntitiesByClass(attachmentClassName);
		}

		return {
			createdDate,
			createdDateString,
			postHref,
			postTitle,
			postBody,
			ratingInformation,
			isReply,
			isUnscored,
			threadTitle,
			attachmentList,
			discussionPostEvaluationEntity,
			wordCount
		};
	}

	_formatDiscussionRatings(discussionPostEntity) {
		if (discussionPostEntity.class.includes(fivestarRatingClass)) {
			return this._getRatingsInfo(fivestarRatingClass, discussionPostEntity);
		} else if (discussionPostEntity.class.includes(upvoteDownvoteRatingClass)) {
			return this._getRatingsInfo(upvoteDownvoteRatingClass, discussionPostEntity);
		} else if (discussionPostEntity.class.includes(upvoteOnlyRatingClass)) {
			return this._getRatingsInfo(upvoteOnlyRatingClass, discussionPostEntity);
		}
		return {};
	}

	async _getDiscussionPostEntities() {
		this._displayedDiscussionPostObjects = [];
		if (typeof this.discussionPostList !== 'undefined') {
			this._displayedDiscussionPostObjects = await Promise.all(this.discussionPostList.map(async discussionPostEvaluationEntity => {
				if (discussionPostEvaluationEntity.links && discussionPostEvaluationEntity.links[0].href) {
					const discussionPost = await this._getDiscussionPostEntity(discussionPostEvaluationEntity.links[0].href);
					if (discussionPost && discussionPost.entity) {
						const discussionPostObject = await this._formatDiscussionPostObject(discussionPost.entity, discussionPostEvaluationEntity);
						return discussionPostObject;
					}
				}
			}));
			this._displayedDiscussionPostObjects = filterDiscussionPosts(this._displayedDiscussionPostObjects, this._selectedFilters);
			sortDiscussionPosts(this._displayedDiscussionPostObjects, this._sortingMethod);
			this._finishedLoading();
		}
	}

	async _getDiscussionPostEntity(discussionPostHref, bypassCache = false) {
		return await window.D2L.Siren.EntityStore.fetch(discussionPostHref, this._token, bypassCache);
	}

	_getRatingsInfo(ratingMethod, discussionPostEntity) {
		this._ratingMethod = ratingMethod;
		switch (ratingMethod) {
			case fivestarRatingClass:
				if (discussionPostEntity.properties.ratingAverage !== undefined && discussionPostEntity.properties.numRatings !== undefined) {
					return { ratingAverage : discussionPostEntity.properties.ratingAverage,
						numRatings : discussionPostEntity.properties.numRatings };
				}
				break;
			case upvoteDownvoteRatingClass:
				if (discussionPostEntity.properties.numUpVotes !== undefined && discussionPostEntity.properties.numDownVotes !== undefined) {
					return { numUpVotes : discussionPostEntity.properties.numUpVotes,
						numDownVotes : discussionPostEntity.properties.numDownVotes };
				}
				break;
			case upvoteOnlyRatingClass:
				if (discussionPostEntity.properties.numUpVotes !== undefined) {
					return { numUpVotes : discussionPostEntity.properties.numUpVotes };
				}
				break;
		}
	}

	_renderDiscussionPost() {
		return html`
			<d2l-consistent-evaluation-discussion-post-page
				?skeleton=${this.skeleton}
				rating-method=${this._ratingMethod}
				.displayedDiscussionPostObjects=${this._displayedDiscussionPostObjects}
				.token=${this.token}
				.filteringStatus=${this._filteringStatus}
			></d2l-consistent-evaluation-discussion-post-page>
		`;
	}
	_renderFilterDropDownList() {
		return html`
			<d2l-labs-filter-dropdown
				class="d2l-consistent-evaluation-evidence-discussion-filter-by-dropdown"
				total-selected-option-count=${this._selectedFilters.length}
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
				selected-option-count=${this._countPostFilters()}
				disable-search
				@d2l-labs-filter-dropdown-option-change=${this._filterPosts}
			>
				<d2l-labs-filter-dropdown-option
					value=${filterByThreads}
					text=${this.localize('threads')}
					?selected=${this._selectedFilters.includes(filterByThreads)}
				></d2l-labs-filter-dropdown-option>
				<d2l-labs-filter-dropdown-option
					value=${filterByReplies}
					text=${this.localize('replies')}
					?selected=${this._selectedFilters.includes(filterByReplies)}
				></d2l-labs-filter-dropdown-option>
			</d2l-labs-filter-dropdown-category>`;
	}

	_renderScoreFilters() {
		if (this.discussionPostList && this.discussionPostList.some(postEntity => postEntity.properties && postEntity.properties.outOf)) {
			return html`<d2l-labs-filter-dropdown-category
					category-text=${this.localize('score')}
					selected-option-count=${this._countScoreFilters()}
					disable-search
					@d2l-labs-filter-dropdown-option-change=${this._filterPosts}
				>
					<d2l-labs-filter-dropdown-option
						value=${filterByUnscored}
						text=${this.localize('unscored')}
						?selected=${this._selectedFilters.includes(filterByUnscored)}
					></d2l-labs-filter-dropdown-option>
					<d2l-labs-filter-dropdown-option
						value=${filterByScored}
						text=${this.localize('scored')}
						?selected=${this._selectedFilters.includes(filterByScored)}
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
				@d2l-labs-sort-by-dropdown-change=${this._sortPosts}
			>
				<d2l-labs-sort-by-dropdown-option value=${sortByOldestFirst} text=${this.localize('oldestFirst')} ?selected=${this._sortingMethod === sortByOldestFirst}></d2l-labs-sort-by-dropdown-option>
				<d2l-labs-sort-by-dropdown-option value=${sortByNewestFirst} text=${this.localize('newestFirst')} ?selected=${this._sortingMethod === sortByNewestFirst}></d2l-labs-sort-by-dropdown-option>
				<d2l-labs-sort-by-dropdown-option value=${sortBySubject} text=${this.localize('postSubject')} ?selected=${this._sortingMethod === sortBySubject}></d2l-labs-sort-by-dropdown-option>
			</d2l-labs-sort-by-dropdown>
		`;
	}

	_sortPosts(e) {
		this._sortingMethod = e.detail.value;
		this._getDiscussionPostEntities().then(() => this.requestUpdate());
	}

}

customElements.define('d2l-consistent-evaluation-evidence-discussion', ConsistentEvaluationEvidenceDiscussion);
