import { filterByReplies, filterByScored, filterByThreads, filterByUnscored, sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../controllers/constants';
import { Rels } from 'd2l-hypermedia-constants';

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

export function filterDiscussionPosts(discussionPostList, selectedFilters) {
	// if all filters/no filters are selected don't filter out anything
	if (selectedFilters.length === 0 || selectedFilters.length === 4) {
		return discussionPostList;
	}

	const newDiscussionPostList = discussionPostList.filter(discussionPost => {
		let satisfiesFilters = true;
		let isReply = discussionPost.hasLinkByRel(Rels.Discussions.thread);
		let isScored = discussionPost.properties.score !== null;
		if (isReply && selectedFilters.includes(filterByThreads) || !isReply && selectedFilters.includes(filterByReplies)) {
			satisfiesFilters = false;
		}
		if (!isScored && selectedFilters.includes(filterByScored) || isScored && selectedFilters.includes(filterByUnscored)) {
			satisfiesFilters = false;
		}
		return satisfiesFilters;
	});
	return newDiscussionPostList;
}
