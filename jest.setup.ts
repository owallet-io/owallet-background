import 'reflect-metadata';
function channelMock() {}
channelMock.prototype.onmessage = function () {}
channelMock.prototype.postMessage = function (data) {
    this.onmessage({ data })
}
global.BroadcastChannel;