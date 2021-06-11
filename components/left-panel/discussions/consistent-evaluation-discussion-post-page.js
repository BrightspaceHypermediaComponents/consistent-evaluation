import './consistent-evaluation-discussion-evidence-body';
import { fivestarRatingClass, upvoteDownvoteRatingClass, upvoteOnlyRatingClass } from '../../controllers/constants.js';
import { css, html, LitElement } from 'lit-element';
import { bodyCompactStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../../../localize-consistent-evaluation.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export class ConsistentEvaluationDiscussionPostPage extends SkeletonMixin(RtlMixin(LocalizeConsistentEvaluation(LitElement))) {
	static get properties() {
		return {
			displayedDiscussionPostObjects: {
				attribute: false,
				type: Array
			},
			_ratingMethod: {
				attribute: false,
				type: String
			}
		};
	}

	static get styles() {
		return [super.styles, bodyCompactStyles, css`
			:host([skeleton]) d2l-consistent-evaluation-discussion-evidence-body {
				display: none;
			}
			:host([skeleton]) .d2l-consistent-evaluation-submission-list-item-skeleton {
				padding: 18px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-title-skeleton {
				height: 11px;
				margin-top: 6px;
				width: 240px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-date-skeleton {
				height: 10px;
				margin-bottom: 24px;
				margin-top: 16px;
				width: 132px;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-text-skeleton {
				height: 11px;
				margin-top: 12px;
				width: 100%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-post-last-text-skeleton {
				height: 11px;
				margin-top: 12px;
				width: 80%;
			}
			:host([skeleton]) .d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton {
				height: 10px;
				text-align: right;
				width: 66px;
			}

			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton {
				text-align: left;
			}

			:host([skeleton]) .d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton {
				float: right;
				margin-left: 12px;
				margin-top: 6px;
			}

			:host([skeleton][dir="rtl"]) .d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton {
				float: left;
				margin-right: 12px;
			}

			:host([skeleton]) .d2l-consistent-evaluation-no-posts-in-range-padding {
				display: none;
			}

			.d2l-consistent-evaluation-no-posts-in-range-padding {
				display: inline-block;
				width: 100%;
			}

			.d2l-consistent-evaluation-no-posts-in-range-container {
				background: white;
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				margin: 1rem;
				padding: 1rem;
			}

			.d2l-consistent-evaluation-no-posts-in-range {
				background: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 0.3rem;
				box-sizing: border-box;
				padding: 2rem;
				width: 100%;
			}

			.d2l-consistent-evaluation-discussion-posts-counts {
				float: left;
				margin-left: 20px;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-discussion-posts-counts {
				float: right;
			}

			.d2l-consistent-evaluation-unscored-status-indicator {
				float: left;
				margin-left: 1rem;
				margin-right: 1rem;
				text-transform: none;
			}

			:host([dir="rtl"]) .d2l-consistent-evaluation-unscored-status-indicator {
				float: right;
			}
		`];
	}

	constructor() {
		super();
		this.displayedDiscussionPostObjects = [];
	}

	render() {
		return html`
			${this._renderDiscussionItemSkeleton()}
			${this._renderDiscussionItemSkeleton()}
			${this._renderPostsHeader()}
			${this._renderDiscussionPostEntities()}
		`;
	}

	_getPostsCounts() {
		let threads = 0;
		let replies = 0;
		this.displayedDiscussionPostObjects.forEach(discussionPost => {
			discussionPost.isReply ? replies++ : threads++;
		});

		return {
			threads: threads,
			replies: replies
		};
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
	_getUnscoredPostsCount() {
		// if the posts aren't individually scored return 'NaN'
		if (typeof this.displayedDiscussionPostObjects !== 'undefined' && typeof this.displayedDiscussionPostObjects[0] !== 'undefined' && !('properties' in this.displayedDiscussionPostObjects[0])) {
			return 'NaN';
		}

		let unscoredPosts = 0;
		if (this.displayedDiscussionPostObjects) {
			this.displayedDiscussionPostObjects.forEach(postEntity => {
				if (postEntity.isUnscored) {
					unscoredPosts++;
				}
			});
		}
		return unscoredPosts;
	}
	_renderDiscussionItemSkeleton() {
		return html`
			<div class="d2l-consistent-evaluation-submission-list-item-skeleton" >
				${this._renderDiscussionRatingSkeleton()}
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-post-title-skeleton"></div>
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-post-date-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-text-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-text-skeleton"></div>
				<div class="d2l-skeletize d2l-skeletize d2l-consistent-evaluation-discussion-post-last-text-skeleton"></div>
			</div>
		`;
	}
	_renderDiscussionPostEntities() {
		if (this.displayedDiscussionPostObjects.length === 0) {
			return html`${this._renderNoPostsInFilteredRange()}`;
		}

		const itemTemplate = [];
		for (let i = 0; i < this.displayedDiscussionPostObjects.length; i++) {
			if (this.displayedDiscussionPostObjects[i]) {
				const discussionPost = this.displayedDiscussionPostObjects[i];
				itemTemplate.push(html`
					<d2l-consistent-evaluation-discussion-evidence-body
						aria-hidden="${this.skeleton}"
						post-href=${discussionPost.postHref}
						post-title=${discussionPost.postTitle}
						post-body=${discussionPost.postBody}
						post-date=${discussionPost.createdDateString}
						?is-reply=${discussionPost.isReply}
						thread-title=${discussionPost.threadTitle}
						rating-method=${ifDefined(this._ratingMethod)}
						word-count=${ifDefined(discussionPost.wordCount)}
						.attachmentsList=${discussionPost.attachmentList}
						.ratingInformation=${discussionPost.ratingInformation}
						.discussionPostEntity=${discussionPost.discussionPostEvaluationEntity}
					></d2l-consistent-evaluation-discussion-evidence-body>`);
			}
		}
		return html`${itemTemplate}`;
	}
	_renderDiscussionRatingSkeleton() {
		return html`<div class="d2l-consistent-evaluation-discussion-evidence-body-rating-container-skeleton">
				<div class="d2l-skeletize d2l-consistent-evaluation-discussion-evidence-body-rating-skeleton"></div>
			</div>`;
	}
	_renderNoPostsInFilteredRange() {
		return html`
			<div class="d2l-consistent-evaluation-no-posts-in-range-padding">
				<div class="d2l-consistent-evaluation-no-posts-in-range-container">
					<div class="d2l-consistent-evaluation-no-posts-in-range d2l-body-standard">${this.localize('noPostsInFilteredRange')}</div>
				</div>
			</div>`;
	}
	_renderPostsCounts() {
		const postsCountInfo = this._getPostsCounts();

		if (postsCountInfo.threads === 0 && postsCountInfo.replies === 0) {
			return html``;
		}

		const postsCountsText = this.localize('postsCount', { numThreads: postsCountInfo.threads, numReplies: postsCountInfo.replies });

		return html`
			<span class="d2l-body-compact d2l-consistent-evaluation-discussion-posts-counts">
				${postsCountsText}
			</span>
		`;
	}
	_renderPostsHeader() {
		return html`
			${this._renderPostsCounts()}
			${this._renderUnscoredStatus()}
			<br>
		`;
	}
	_renderUnscoredStatus() {
		const unscoredPosts = this._getUnscoredPostsCount();
		if (!isNaN(unscoredPosts)) {
			return html`
				<d2l-status-indicator
					class="d2l-consistent-evaluation-unscored-status-indicator"
					?hidden=${this.skeleton}
					state=${(unscoredPosts === 0 ? 'success' : 'default')}
					text=${(unscoredPosts === 0 ? this.localize('allPostsScored') : this.localize('unscoredPosts', { num: this._getUnscoredPostsCount() }))}>
				</d2l-status-indicator>
			`;
		}
	}

}

customElements.define('d2l-consistent-evaluation-discussion-post-page', ConsistentEvaluationDiscussionPostPage);
