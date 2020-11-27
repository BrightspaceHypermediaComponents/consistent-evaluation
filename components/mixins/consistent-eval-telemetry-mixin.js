import Events from 'd2l-telemetry-browser-client';

export const ConsistentEvalTelemetryMixin = superclass => class extends superclass {
	//Mark that a page has been loaded
	logLoadEvent(href, type, telemetryId) {
		if (!href || !type || !telemetryId) return;

		const measureName = `d2l-consistent-eval-${type}.page.rendered`;
		performance.measure(measureName);
		this._logUserEvent(href, 'LoadView', type, telemetryId, measureName);
	}

	//Submit an event measure
	logEvent(href, type, telemetryId) {
		if (!href || !type || !telemetryId) return;

		const measureName = `d2l-consistent-eval-event-${type}`;

		performance.clearMeasures(measureName);

		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.measure(measureName, eventStartMarkName);
		this._logUserEvent(href, 'MeasureTiming', type, telemetryId, measureName);
	}

	//Begin measuring an event
	markEventStart(type, telemetryId) {
		if (!type || !telemetryId) return;
		const eventStartMarkName = this._getEventStartMarkName(type);
		performance.clearMarks(eventStartMarkName);
		performance.mark(eventStartMarkName);
	}

	_getEventStartMarkName(type) {
		return `d2l-consistent-eval-event-${type}`;
	}
	async _logUserEvent(href, action, type, telemetryId, performanceMeasureName) {
		if (!href || !action || !type || !telemetryId || !performanceMeasureName) return;

		const eventBody = new Events.PerformanceEventBody()
			.setAction(action)
			.setObject(href, type)
			.addUserTiming(performance.getEntriesByName(performanceMeasureName));
		const event = new Events.TelemetryEvent()
			.setType('PerformanceEvent')
			.setDate(new Date())
			.setSourceId('consistent-eval')
			.setBody(eventBody);
		const client = await D2L.Telemetry.CreateClient();
		client.logUserEvent(event);
	}

};
