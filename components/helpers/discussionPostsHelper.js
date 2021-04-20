import { filterByReplies, filterByScored, filterByThreads, filterByUnscored, sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../controllers/constants';

export function sortDiscussionPosts(discussionPostObjects, sortingMethod) {
	if (sortingMethod === sortByNewestFirst) {
		discussionPostObjects.sort((a, b) => {
			return b.createdDate.getTime() - a.createdDate.getTime();
		});

	} else if (sortingMethod === sortByOldestFirst) {
		discussionPostObjects.sort((a, b) => {
			return a.createdDate.getTime() - b.createdDate.getTime();
		});

	} else if (sortingMethod === sortBySubject) {
		discussionPostObjects.sort((a, b) => {
			if (a.postTitle < b.postTitle) {
				return -1;
			} else if (a.postTitle > b.postTitle) {
				return 1;
			}
			return 0;
		});
	}
	return discussionPostObjects;
}

export function filterDiscussionPosts(discussionPostObjects, selectedPostFilters, selectedScoreFilters) {
	// if all filters/no filters are selected don't filter out anything
	if (selectedPostFilters.length === 0 || selectedPostFilters.length === 2) {
		if (selectedScoreFilters.length === 0 || selectedScoreFilters.length === 2) {
			return discussionPostObjects;
		}
	}

	const newDiscussionPostObjects = discussionPostObjects.filter(discussionPost => {
		let satisfiesPostFilters = true;
		let satisfiesScoreFilters = true;
		if (selectedPostFilters.length > 0) {
			satisfiesPostFilters = discussionPost.isReply ? selectedPostFilters.includes(filterByReplies) : selectedPostFilters.includes(filterByThreads);
		}
		if (selectedScoreFilters.length > 0) {
			const score = discussionPost.discussionPostEvaluationEntity.properties.score;
			satisfiesScoreFilters = score === null ? selectedScoreFilters.includes(filterByUnscored) : selectedScoreFilters.includes(filterByScored);
		}
		return satisfiesPostFilters && satisfiesScoreFilters;

	});
	return newDiscussionPostObjects;
}
