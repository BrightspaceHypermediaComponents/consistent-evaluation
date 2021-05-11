import './consistent-evaluation-page.js';
import { assignmentActivity, attachmentClassName, coaActivity, discussionActivity } from './controllers/constants';
import { css, html, LitElement } from 'lit-element';
import { Awaiter } from './awaiter.js';
import { ConsistentEvalTelemetry } from './helpers/consistent-eval-telemetry.js';
import { ConsistentEvaluationHrefController } from './controllers/ConsistentEvaluationHrefController.js';
import { getSubmissions } from './helpers/submissionsAndFilesHelpers.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { LocalizeConsistentEvaluation } from '../localize-consistent-evaluation.js';
import { Rels } from 'd2l-hypermedia-constants';

export class ConsistentEvaluation extends LocalizeConsistentEvaluation(LitElement) {

	static get properties() {
		return {
			_loading: {
				type: Boolean,
				attribute: false
			},
			href: { type: String },
			token: { type: Object },
			returnHref: {
				attribute: 'return-href',
				type: String
			},
			returnHrefText: {
				attribute: 'return-href-text',
				type: String
			},
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			},
			useNewHtmlEditor: {
				attribute: 'use-new-html-editor',
				type: Boolean
			},
			displayConversionWarning: {
				attribute: 'display-conversion-warning',
				type: Boolean
			},
			_rubricReadOnly: { type: Boolean },
			_childHrefs: { type: Object },
			_rubricInfos: { type: Array },
			_submissionInfo: { type: Object },
			_gradeItemInfo: { type: Object },
			_enrolledUser: { type: Object },
			_groupInfo: { type: Object },
			_userName: { type: String },
			_navTitleInfo: { type: Object },
			_iteratorTotal: { type: Number },
			_iteratorIndex: { type: Number },
			_editActivityPath: { type: String },
			_activityType: { type: String },
			fileId: {
				attribute: 'file-id',
				type: String
			},
			currentFileId: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
			d2l-consistent-evaluation-page {
				width: 100%;
			}
		`;
	}

	constructor() {
		super();

		// Only show the scrollbar when necessary
		document.body.style.overflow = 'auto';
		document.documentElement.style.overflow = 'auto'; // needed for FF bug

		this.href = undefined;
		this.token = undefined;
		this._rubricReadOnly = false;
		this._richTextEditorDisabled = false;
		this._childHrefs = undefined;
		this._rubricInfos = undefined;
		this._submissionInfo = undefined;
		this._gradeItemInfo = undefined;
		this._groupInfo = undefined;
		this._anonymousInfo = undefined;
		this._editActivityPath = undefined;
		this._navTitleInfo = {};
		this.returnHref = undefined;
		this.returnHrefText = undefined;
		this._mutex = new Awaiter();
		this._loading = true;
		this._loadingComponents = {
			discussions: true,
			main : true,
			submissions: true
		};
	}

	render() {
		return html`
			<d2l-consistent-evaluation-page
				?skeleton=${this._loading}
				outcomes-href=${ifDefined(this._childHrefs && this._childHrefs.alignmentsHref)}
				evaluation-href=${ifDefined(this._childHrefs && this._childHrefs.evaluationHref)}
				next-student-href=${ifDefined(this._childHrefs && this._childHrefs.nextHref)}
				user-href=${ifDefined(this._childHrefs && this._childHrefs.userHref)}
				group-href=${ifDefined(this._childHrefs && this._childHrefs.groupHref)}
				user-progress-outcome-href=${ifDefined(this._childHrefs && this._childHrefs.userProgressOutcomeHref)}
				coa-demonstration-href=${ifDefined(this._childHrefs && this._childHrefs.coaDemonstrationHref)}
				special-access-href=${ifDefined(this._childHrefs && this._childHrefs.specialAccessHref)}
				return-href=${ifDefined(this.returnHref)}
				return-href-text=${ifDefined(this.returnHrefText)}
				data-telemetry-endpoint=${ifDefined(this.dataTelemetryEndpoint)}
				rubric-popout-location=${ifDefined(this._childHrefs && this._childHrefs.rubricPopoutLocation)}
				download-all-submissions-location=${ifDefined(this._childHrefs && this._childHrefs.downloadAllSubmissionLink)}
				edit-activity-path=${ifDefined(this._editActivityPath)}
				activity-type=${this._activityType}
				discussion-calculation-type=${ifDefined(this._discussionTopicInfo && this._discussionTopicInfo.calculationType)}
				discussion-topic-link=${ifDefined(this._discussionTopicInfo && this._discussionTopicInfo.topicLink)}
				.currentFileId=${this.currentFileId}
				.rubricInfos=${this._rubricInfos}
				.submissionInfo=${this._submissionInfo}
				.gradeItemInfo=${this._gradeItemInfo}
				.navTitleInfo=${this._navTitleInfo}
				.userName=${this._userName}
				.iteratorTotal=${this._iteratorTotal}
				.iteratorIndex=${this._iteratorIndex}
				.token=${this.token}
				.href=${this.href}
				.enrolledUser=${this._enrolledUser}
				.groupInfo=${this._groupInfo}
				.anonymousInfo=${this._anonymousInfo}
				.discussionPostList=${this._discussionPostList}
				?rubric-read-only=${this._rubricReadOnly}
				?hide-learner-context-bar=${this._shouldHideLearnerContextBar()}
				?use-new-html-editor=${this.useNewHtmlEditor}
				?display-conversion-warning=${this.displayConversionWarning}
				@d2l-consistent-evaluation-previous-student-click=${this._onPreviousStudentClick}
				@d2l-consistent-evaluation-next-student-click=${this._onNextStudentClick}
				@d2l-consistent-evaluation-loading-finished=${this._finishedLoading}
				@d2l-consistent-eval-rubric-popup-closed=${this._refreshRubrics}
				@d2l-consistent-eval-on-evaluation-save=${this._refreshRubrics}
			></d2l-consistent-evaluation-page>
		`;
	}
	async updated(changedProperties) {
		super.updated();
		if (changedProperties.has('dataTelemetryEndpoint')) {
			this._telemetry = new ConsistentEvalTelemetry(this.dataTelemetryEndpoint);
		}
		if (changedProperties.has('href')) {
			await this._mutex.dispatch(
				async() => {
					const controller = new ConsistentEvaluationHrefController(this.href, this.token);

					const mainPagePromises = [
						controller.getHrefs(),
						controller.getActivityType(),
						controller.getRubricInfos(false),
						controller.getEnrolledUser(),
						controller.getGroupInfo(),
						controller.getAnonymousInfo(),
						controller.getIteratorInfo('total'),
						controller.getIteratorInfo('index'),
						controller.getEditActivityPath(),
						controller.getGradeItemInfo()
					].map(p => p.catch(undefined));

					await Promise.all(mainPagePromises).then(([
						childHrefs,
						activityType,
						rubricInfos,
						enrolledUser,
						groupInfo,
						anonymousInfo,
						iteratorTotal,
						iteratorIndex,
						editActivityPath,
						gradeItemInfo
					]) => {
						this._childHrefs = childHrefs;
						this._activityType = activityType;
						this._rubricInfos = rubricInfos;
						this._enrolledUser = enrolledUser;
						this._groupInfo = groupInfo;
						this._anonymousInfo = anonymousInfo;
						this._iteratorTotal = iteratorTotal;
						this._iteratorIndex = iteratorIndex;
						this._editActivityPath = editActivityPath;
						this._gradeItemInfo = gradeItemInfo;
					});

					if (this._activityType === assignmentActivity || this._activityType === coaActivity) {
						this._loadingComponents.discussions = false;
						const stripped = this._stripFileIdFromUrl();

						const assignmentPromises = [
							controller.getSubmissionInfo(),
							controller.getUserName(),
							controller.getAssignmentOrganizationName('assignment'),
							controller.getAssignmentOrganizationName('organization'),
						].map(p => p.catch(undefined));

						await Promise.all(assignmentPromises).then(([
							submissionInfo,
							userName,
							titleName,
							subtitleName
						])  => {
							this._submissionInfo = submissionInfo;
							this._userName = userName;
							this._navTitleInfo = {
								'titleName' : titleName,
								'subtitleName': subtitleName
							};
						});
						const hasOneFileAndSubmission = this._hasOneFileAndOneSubmission();

						if (!stripped && !hasOneFileAndSubmission) {
							this.currentFileId = undefined;
							this.shadowRoot.querySelector('d2l-consistent-evaluation-page')._setSubmissionsView();
						} else {
							this._loadingComponents.submissions = false;
						}

						if (!this._submissionInfo || !this._submissionInfo.submissionList) {
							this._loadingComponents.submissions = false;
						}
					} else if (this._activityType === discussionActivity) {
						this._loadingComponents.submissions = false;

						const discussionPromises = [
							controller.getDiscussionPostsInfo(),
							controller.getDiscussionTopicInfo()
						].map(p => p.catch(undefined));

						await Promise.all(discussionPromises).then(([
							discussionPostList,
							discussionTopicInfo
						]) => {
							this._discussionPostList = discussionPostList;
							this._discussionTopicInfo = discussionTopicInfo;
						});

						this._navTitleInfo = {
							'titleName' : this._discussionTopicInfo.topicName,
							'subtitleName': this._discussionTopicInfo.forumName
						};
					}

					this._loadingComponents.main = false;
					this._finishedLoading();
				}
			);
		}
	}

	_finishedLoading(e) {
		if (e) {
			this._loadingComponents[e.detail.component] = false;
		}

		for (const component in this._loadingComponents) {
			if (this._loadingComponents[component] === true) {
				return;
			}
		}
		this._loading = false;
		this._setTitle();
		if (this._activityType === assignmentActivity && this._telemetry && this._submissionInfo.submissionList) {
			this._telemetry.logLoadEvent('consistentEvalMain', assignmentActivity, this._submissionInfo.submissionList.length);
		} else if (this._activityType === discussionActivity && this._telemetry) {
			this._telemetry.logLoadEvent('consistentEvalMain', discussionActivity, undefined);
		}
	}
	async _hasOneFileAndOneSubmission() {
		if (this._submissionInfo && this._submissionInfo.submissionList && this._submissionInfo.submissionList.length === 1) {
			const submissions = await getSubmissions(this._submissionInfo, this.token);
			const attachmentList = submissions[0].entity.getSubEntityByRel(Rels.Assignments.attachmentList);
			const numberOfSubmittedFiles = attachmentList.entities.length;

			if (numberOfSubmittedFiles === 1) {
				const isTiiEnabled = attachmentList.entities[0].hasSubEntityByRel(Rels.Assignments.turnItIn);
				const hasComments = attachmentList.entities[0].properties?.comment || false;
				if (!isTiiEnabled && !hasComments) {
					const attachmentEntity = attachmentList.getSubEntityByClass(attachmentClassName);
					// If the attachment is a link attachment, it should not be opened in the file viewer.
					if (attachmentEntity.properties.extension && attachmentEntity.properties.extension.toLowerCase() === 'url') {
						return false;
					} else {
						const fileId = attachmentEntity.properties.id;
						this.currentFileId = fileId;
						return true;
					}
				}
			}
		}
		return false;
	}

	async _onNextStudentClick() {
		await this._mutex.dispatch(
			async() => {
				const nextStudentHref = this._childHrefs?.nextHref;
				if (nextStudentHref) {
					this._updateCurrentUrl(nextStudentHref);
					this.href = nextStudentHref;
					this._setLoading();
				}
			}
		);
	}
	async _onPreviousStudentClick() {
		await this._mutex.dispatch(
			async() => {
				const previousStudentHref = this._childHrefs?.previousHref;
				if (previousStudentHref) {
					this._updateCurrentUrl(previousStudentHref);
					this.href = previousStudentHref;
					this._setLoading();
				}
			}
		);
	}
	async _refreshRubrics() {
		const controller = new ConsistentEvaluationHrefController(this.href, this.token);
		this._rubricInfos = await controller.getRubricInfos(true);
	}
	_setLoading() {
		for (const component in this._loadingComponents) {
			this._loadingComponents[component] = true;
		}
		this._loading = true;
	}
	_setTitle() {
		if (this._userName && this._navTitleInfo.titleName) {
			const title = document.createElement('title');
			title.textContent = this.localize('assignmentPageTitle', { userName: this._userName, activityName: this._navTitleInfo.titleName });
			document.head.insertBefore(title, document.head.firstChild);
		}
	}
	_shouldHideLearnerContextBar() {
		return this._childHrefs && this._childHrefs.userProgressOutcomeHref;
	}
	_stripFileIdFromUrl() {
		if (this.fileId) {
			const fileIdQueryName = 'fileId';
			const urlWithoutFileQuery = window.location.href.replace(`&${fileIdQueryName}=${this.fileId}`, '');
			history.replaceState({}, document.title, urlWithoutFileQuery);

			this.currentFileId = this.fileId;
			this.fileId = undefined;

			return true;
		}

		return false;
	}

	_updateCurrentUrl(targetHref) {
		const targetHrefUrl = new URL(targetHref);
		if (targetHrefUrl) {
			const queryString = targetHrefUrl.search;
			const searchParams = new URLSearchParams(queryString);
			const nextActorUsageId = searchParams.get('currentActorUsageId');

			if (nextActorUsageId) {
				const currentUrl = new URL(window.location.href);
				const currentUrlQueryString = currentUrl.search;
				const currentUrlSearchParams = new URLSearchParams(currentUrlQueryString);
				currentUrlSearchParams.set('currentActorActivityUsage', nextActorUsageId);
				currentUrl.search = currentUrlSearchParams.toString();

				window.history.replaceState(null, null, currentUrl.toString());
			}
		}
	}
}

customElements.define('d2l-consistent-evaluation', ConsistentEvaluation);
