/* Speech Recognition Engine wrapper */

class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResult = null;
    this.onInterim = null;
    this.onError = null;
    this.onEnd = null;
    this.shouldRestart = false;
  }

  isSupported() {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  }

  init() {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      if (this.recognition) {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
      }
    } catch (e) {}

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript && this.onResult) {
        this.onResult(finalTranscript.trim());
      }
      if (interimTranscript && this.onInterim) {
        this.onInterim(interimTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are non-fatal in continuous mode
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      if (event.error === 'network') {
        // In Brave or intermittent network, keep shouldRestart true with small delay
        console.warn('SpeechRecognition network note, will retry when speaking.');
      } else {
        console.warn('SpeechRecognition error:', event.error);
      }
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if session is actively listening
      if (this.shouldRestart && this.isListening) {
        setTimeout(() => {
          if (this.shouldRestart && this.isListening) {
            try {
              this.init();
              this.recognition.start();
            } catch (e) {
              console.warn('SpeechRecognition auto-restart notice:', e);
            }
          }
        }, 250);
      } else {
        this.isListening = false;
        if (this.onEnd) {
          this.onEnd();
        }
      }
    };
  }

  start() {
    this.shouldRestart = true;
    this.isListening = true;
    if (!this.recognition) {
      this.init();
    }
    try {
      this.recognition.start();
    } catch (e) {
      try {
        this.init();
        this.recognition.start();
      } catch (err) {
        console.warn('SpeechRecognition start notice:', err);
      }
    }
  }

  pause() {
    this.shouldRestart = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  stop() {
    this.shouldRestart = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  destroy() {
    this.stop();
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
      } catch (e) {}
      this.recognition = null;
    }
  }
}

export default SpeechEngine;
