const socket = new WebSocket('ws://vidz.boufnichel.dev');
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
const peerConnection = new RTCPeerConnection(configuration)
let isSender = false

// Connection opened
socket.addEventListener('open', (event) => {
    console.log("socket ok")
});

// Listen for messages
socket.addEventListener('message', async (event) => {
    console.log('Message from server ', event.data);
    const data = JSON.parse(event.data)
    switch (data.type) {
        case 'offer':
            peerConnection.ontrack = (tracks) => {
                console.log("got tracks!!!", tracks)
                const video = document.querySelector("#video")
                if (tracks.streams.length > 0) {

                    video.srcObject = tracks.streams[0];
                }
                //video.play()
            }
            //document.querySelector("#startAsSender").remove()
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.value))
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: 'answer', value: answer }))

            return
        case 'answer':
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.value))
            return
        case 'ice':
            try {
                if (!data.value.candidate) {
                    await peerConnection.addIceCandidate(null);
                } else {
                    await peerConnection.addIceCandidate(data.value);
                }
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
    }
});

document.querySelector("#startAsSender").onclick = async () => {
    isSender = true
    const video = document.querySelector("#video")
    video.src = "https://working.streamingaw.online/DDL/ANIME/OnePiece/OnePiece_Ep_1053_SUB_ITA.mp4"
    video.play()
    await new Promise(res => setTimeout(res, 1000))

    const stream = video.captureStream()
    console.log(stream)
    stream.getTracks().forEach(track => {
        console.log("adding track", track)
        peerConnection.addTrack(track, stream)
    });
    //document.querySelector("#startAsSender").remove()
    peerConnection.addTransceiver("audio");
    peerConnection.addTransceiver("video");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: 'offer', value: offer }))
}
peerConnection.addEventListener('icecandidate', event => {
    const message = {
        type: 'candidate',
        candidate: null,
    };
    if (event.candidate) {
        message.candidate = event.candidate.candidate;
        message.sdpMid = event.candidate.sdpMid;
        message.sdpMLineIndex = event.candidate.sdpMLineIndex;
    }

    socket.send(JSON.stringify({ type: 'ice', value: message }))

});

peerConnection.addEventListener('connectionstatechange', event => {
    console.log(peerConnection.connectionState)
});