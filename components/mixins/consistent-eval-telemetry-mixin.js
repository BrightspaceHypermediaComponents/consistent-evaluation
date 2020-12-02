import Events from 'd2l-telemetry-browser-client';

export const ConsistentEvalTelemetryMixin = superclass => class extends superclass {
	static get properties() {
		return {
			dataTelemetryEndpoint: {
				attribute: 'data-telemetry-endpoint',
				type: String
			}};
	}
	//Mark that a page has been loaded
	logLoadEvent(href, type) {
		if (!href || !type) return;

		const measureName = `d2l-consistent-eval-${type}.page.rendered`;
		performance.measure(measureName);
		this._logUserEvent(href, 'LoadView', type, measureName);
	}

	//Submit an event measure
	markEventEndAndLog(href, type) {
		if (!href || !type) return;

		const measureName = `d2l-consistent-eval-event-${type}`;

		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.measure(measureName, eventStartMarkName);
		this._logUserEvent(href, 'MeasureTiming', type, measureName);
	}

	//Begin measuring an event
	markEventStart(type) {
		if (!type) return;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.clearMarks(eventStartMarkName);
		performance.mark(eventStartMarkName);
	}

	_getEventStartMarkName(type) {
		return `d2l-consistent-eval-event-${type}`;
	}

	async _logUserEvent(href, action, type, performanceMeasureName) {
		if (!href || !action || !type || !performanceMeasureName) return;

		const eventBody = new Events.PerformanceEventBody()
			.setAction(action)
			.setObject(href, type)
			.addUserTiming(performance.getEntriesByName(performanceMeasureName));
		const event = new Events.TelemetryEvent()
			.setType('PerformanceEvent')
			.setDate(new Date())
			.setSourceId('consistent-eval')
			.setBody(eventBody);
		const client = await D2L.Telemetry.CreateClient({endpoint: this.dataTelemetryEndpoint});
		client.logUserEvent(event);
	}

};
