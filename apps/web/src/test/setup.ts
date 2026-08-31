import EventSourceMock from "eventsourcemock"

// biome-ignore lint/suspicious/noExplicitAny: Global EventSource mock requires any cast
;(window as any).EventSource = EventSourceMock as any
