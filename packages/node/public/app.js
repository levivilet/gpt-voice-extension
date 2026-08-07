const toggleBtn = document.getElementById('toggle')
const statusEl = document.getElementById('status')
const bubble = document.getElementById('bubble')
const transcriptEl = document.getElementById('transcript')

let pc = null
let dc = null
let micStream = null
let audioCtx = null
let micAnalyser = null
let remoteAnalyser = null
let rafId = null
let active = false

// Keeps track of the in-progress transcript lines so streamed deltas
// can be appended to the same <span> instead of creating new ones.
let currentUserLine = null
let currentAiLine = null

function addLine(role) {
  const line = document.createElement('div')
  line.className = 'line'
  const label = document.createElement('span')
  label.className = `label ${role}`
  label.textContent = role === 'you' ? 'You:' : 'AI:'
  const text = document.createElement('span')
  line.append(label, text)
  transcriptEl.appendChild(line)
  transcriptEl.scrollTop = transcriptEl.scrollHeight
  return text
}

function appendUserText(delta) {
  if (!currentUserLine) currentUserLine = addLine('you')
  currentUserLine.textContent += delta
}
function finishUserLine() {
  currentUserLine = null
}
function appendAiText(delta) {
  if (!currentAiLine) currentAiLine = addLine('ai')
  currentAiLine.textContent += delta
}
function finishAiLine() {
  currentAiLine = null
}

function handleServerEvent(event) {
  switch (event.type) {
    // --- user speech -> text (live transcription of your mic) ---
    case 'conversation.item.input_audio_transcription.delta':
      appendUserText(event.delta)
      break
    case 'conversation.item.input_audio_transcription.completed':
      finishUserLine()
      break

    // --- model's spoken reply -> text, streamed alongside the audio ---
    case 'response.output_audio_transcript.delta':
    case 'response.audio_transcript.delta': // older event name, kept for compatibility
      appendAiText(event.delta)
      break
    case 'response.output_audio_transcript.done':
    case 'response.audio_transcript.done':
      finishAiLine()
      break

    case 'error':
      console.error('Realtime error event:', event)
      break
  }
}

function setupLevelMeter(stream, kind) {
  const source = audioCtx.createMediaStreamSource(stream)
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.6
  source.connect(analyser)
  return analyser
}

function readLevel(analyser) {
  const data = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(data)
  let sumSquares = 0
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128
    sumSquares += v * v
  }
  return Math.sqrt(sumSquares / data.length) // ~0 (silence) to ~0.6 (loud)
}

function animateBubble() {
  const micLevel = micAnalyser ? readLevel(micAnalyser) : 0
  const aiLevel = remoteAnalyser ? readLevel(remoteAnalyser) : 0
  const level = Math.max(micLevel, aiLevel)
  const scale = 1 + Math.min(level * 3.2, 0.9)
  bubble.style.transform = `scale(${scale.toFixed(3)})`
  bubble.classList.toggle('listening', micLevel > aiLevel && micLevel > 0.03)
  rafId = requestAnimationFrame(animateBubble)
}

async function start() {
  toggleBtn.disabled = true
  statusEl.textContent = 'connecting…'

  // 1. Get a short-lived ephemeral key from our own backend.
  const tokenRes = await fetch('/token')
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) {
    statusEl.textContent = 'error — check server logs / API key'
    toggleBtn.disabled = false
    console.error(tokenData)
    return
  }
  const ephemeralKey = tokenData.value

  // 2. Set up the WebRTC peer connection.
  pc = new RTCPeerConnection()

  const remoteAudio = document.createElement('audio')
  remoteAudio.autoplay = true
  pc.ontrack = (e) => {
    remoteAudio.srcObject = e.streams[0]
    remoteAnalyser = setupLevelMeter(e.streams[0], 'remote')
  }

  micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  pc.addTrack(micStream.getTracks()[0])

  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  micAnalyser = setupLevelMeter(micStream, 'mic')

  dc = pc.createDataChannel('oai-events')
  dc.addEventListener('message', (e) => handleServerEvent(JSON.parse(e.data)))

  // 3. Standard WebRTC offer/answer handshake against the Realtime API.
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp',
    },
  })
  const answerSdp = await sdpResponse.text()
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

  active = true
  statusEl.textContent = 'listening'
  toggleBtn.textContent = 'Stop'
  toggleBtn.classList.add('stop')
  toggleBtn.disabled = false
  animateBubble()
}

function stop() {
  active = false
  if (rafId) cancelAnimationFrame(rafId)
  if (pc) pc.close()
  if (micStream) micStream.getTracks().forEach((t) => t.stop())
  if (audioCtx) audioCtx.close()
  pc = dc = micStream = audioCtx = micAnalyser = remoteAnalyser = null
  bubble.style.transform = 'scale(1)'
  bubble.classList.remove('listening')
  statusEl.textContent = 'idle'
  toggleBtn.textContent = 'Start talking'
  toggleBtn.classList.remove('stop')
}

toggleBtn.addEventListener('click', () => (active ? stop() : start()))
