import Events from 'd2l-telemetry-browser-client';

export class ConsistentEvalTelemetry {

	constructor(dataTelemetryEndpoint) {
		this._dataTelemetryEndpoint = dataTelemetryEndpoint;
	}

	//Mark that a page has been loaded
	logLoadEvent(type, submissionCount) {
		if (!type) { return; }

		const measureName = `d2l-consistent-eval-${type}.page.rendered`;
		performance.measure(measureName);
		this._logUserEvent(window.location.hostname, 'LoadView', type, measureName, submissionCount);
	}

	//Submit an event measure
	markEventEndAndLog(type, submissionCount) {
		if (!type) { return; }

		const measureName = `d2l-consistent-eval-event-${type}`;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.measure(measureName, eventStartMarkName);
		this._logUserEvent(window.location.hostname, 'MeasureTiming', type, measureName, submissionCount);
	}

	//Begin measuring an event
	markEventStart(type) {
		if (!type) { return; }
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.clearMarks(eventStartMarkName);
		performance.mark(eventStartMarkName);
	}

	_getEventStartMarkName(type) {
		return `d2l-consistent-eval-event-${type}`;
	}

	async _logUserEvent(href, action, type, performanceMeasureName, submissionCount) {
		if (!href || !action || !type || !performanceMeasureName) { return; }

		const eventBody = new Events.PerformanceEventBody()
			.setAction(action)
			.setObject(href, type)
			.addUserTiming(performance.getEntriesByName(performanceMeasureName));
		if (submissionCount) {
			eventBody.addCustom('SubmissionCount', `${submissionCount}`);
		}
		const event = new Events.TelemetryEvent()
			.setType('PerformanceEvent')
			.setDate(new Date())
			.setSourceId('consistent-eval')
			.setBody(eventBody);
		const client = new Events.Client({endpoint: this._dataTelemetryEndpoint});
		client.logUserEvent(event);
	}

}
