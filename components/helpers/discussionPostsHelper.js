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

export function filterDiscussionPosts(discussionPostObjects, selectedFilters) {
	// if all filters/no filters are selected don't filter out anything
	if (selectedFilters.length === 0 || selectedFilters.length === 4) {
		return discussionPostObjects;
	}

	const newDiscussionPostObjects  = discussionPostObjects.filter(discussionPost => {
		let satisfiesFilters = true;
		satisfiesFilters = discussionPost.isReply ? selectedFilters.includes(filterByReplies) : selectedFilters.includes(filterByThreads);
		const score = discussionPost.discussionPostEvaluationEntity.properties.score;
		satisfiesFilters = score === null ? selectedFilters.includes(filterByUnscored) : selectedFilters.includes(filterByScored);
		return satisfiesFilters;
	});
	return newDiscussionPostObjects;
}
