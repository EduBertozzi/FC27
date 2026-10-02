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

  it("deduplica resultados cumulativos do Chrome no Android", () => {
    const final = (t: string) => Object.assign([{ transcript: t }], { isFinal: true });
    const results = [
      final("joguei"),
      final("joguei contra"),
      final("joguei contra o Porto"),
      final("ganhamos de 2 a 1"),
    ];
    expect(joinResults(results)).toBe("joguei contra o Porto ganhamos de 2 a 1");
  });

  it("prefere a alternativa que soa como futebol", () => {
    const result = Object.assign(
      [{ transcript: "joguei contra o porto ganhamos de três a um" }, { transcript: "x" }],
      { isFinal: true },
    );
    const swapped = Object.assign([result[1]!, result[0]!], { isFinal: true });
    const rank = (t: string) => (t.includes("porto") ? 5 : 0);
    expect(joinResults([swapped], rank)).toBe("joguei contra o porto ganhamos de três a um");
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

  it("retoma a escuta após uma pausa e acumula o texto até o usuário parar", () => {
    const instances: FakeAuto[] = [];
    class FakeAuto {
      lang = "";
      continuous = false;
      interimResults = false;
      maxAlternatives = 0;
      onresult: ((e: unknown) => void) | null = null;
      onerror = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {}
      stop() {
        this.onend?.();
      }
      abort() {}
      say(t: string) {
        this.onresult?.({ results: [Object.assign([{ transcript: t }], { isFinal: true })] });
      }
    }
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeAuto;
    const onEnd = vi.fn();
    const transcriber = new WebSpeechTranscriber();
    transcriber.start({ onText: vi.fn(), onEnd, onError: vi.fn() });
    instances[0]!.say("joguei contra o porto");
    instances[0]!.onend?.(); // o navegador encerrou sozinho na pausa
    expect(onEnd).not.toHaveBeenCalled();
    instances[1]!.say("ganhamos de dois a um");
    transcriber.stop();
    expect(onEnd).toHaveBeenCalledWith("joguei contra o porto ganhamos de dois a um");
    delete (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition;
  });
});
