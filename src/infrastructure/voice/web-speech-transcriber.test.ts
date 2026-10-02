import { joinResults, WebSpeechTranscriber } from "./web-speech-transcriber";

describe("WebSpeechTranscriber", () => {
  it("junta resultados finais e parciais em um texto só", () => {
    const results = Object.assign(
      [
        Object.assign([{ transcript: "joguei contra o Arsenal " }], { isFinal: true }),
        Object.assign([{ transcript: " ganhamos de três a um" }], { isFinal: false }),
      ],
      {},
    );
    expect(joinResults(results)).toBe("joguei contra o Arsenal ganhamos de três a um");
  });

  it("informa quando o navegador não suporta reconhecimento de fala", () => {
    const transcriber = new WebSpeechTranscriber();
    expect(transcriber.isSupported()).toBe(false);
    const onError = vi.fn();
    transcriber.start({ onText: vi.fn(), onEnd: vi.fn(), onError });
    expect(onError).toHaveBeenCalledWith("not-supported");
  });

  it("usa a implementação do navegador quando existe", () => {
    const started = vi.fn();
    class FakeRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      maxAlternatives = 0;
      onresult = null;
      onerror = null;
      onend = null;
      start = started;
      stop = vi.fn();
      abort = vi.fn();
    }
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition =
      FakeRecognition;
    const transcriber = new WebSpeechTranscriber();
    expect(transcriber.isSupported()).toBe(true);
    transcriber.start({ onText: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    expect(started).toHaveBeenCalled();
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });
});
