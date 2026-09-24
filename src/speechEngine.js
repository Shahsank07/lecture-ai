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
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
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
      console.warn('SpeechRecognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if recording is actively listening
      if (this.shouldRestart && this.isListening) {
        setTimeout(() => {
          if (this.shouldRestart && this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore if already active or starting
            }
          }
        }, 200);
      } else {
        this.isListening = false;
        if (this.onEnd) {
          this.onEnd();
        }
      }
    };
  }

  start() {
    if (!this.recognition) {
      this.init();
    }
    this.shouldRestart = true;
    this.isListening = true;
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
      this.recognition.stop();
    }
  }

  stop() {
    this.shouldRestart = false;
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  destroy() {
    this.stop();
    this.recognition = null;
  }
}

export default SpeechEngine;
