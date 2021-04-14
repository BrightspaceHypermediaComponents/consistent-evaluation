import { sortByNewestFirst, sortByOldestFirst, sortBySubject } from '../controllers/constants';

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
