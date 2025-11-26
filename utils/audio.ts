// Utility to handle PCM audio from Gemini TTS

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, // Gemini TTS standard output rate
    });
  }
  return audioContext;
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playPCMAudio(base64Data: string) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const byteData = decodeBase64(base64Data);
    const dataInt16 = new Int16Array(byteData.buffer);
    
    // Gemini sends mono audio
    const numChannels = 1;
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(numChannels, frameCount, 24000);
    
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        // Normalize 16-bit integer to float [-1, 1]
        channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    
    return source; // Return source in case we want to stop it later
  } catch (error) {
    console.error("Error playing audio:", error);
    throw error;
  }
}