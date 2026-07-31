import WebSocket from "ws";
import { config } from "./config.js";
import {
  completeCall,
  getOrg,
  logCallEvent,
  searchKb,
  transferToHuman,
  type OrgPayload,
} from "./internal-api.js";

type TwilioStartMessage = {
  event: "start";
  start: {
    streamSid: string;
    callSid: string;
    customParameters?: Record<string, string>;
  };
};

type TwilioMediaMessage = {
  event: "media";
  media: { payload: string };
};

type TwilioStopMessage = {
  event: "stop";
};

type TwilioMessage = TwilioStartMessage | TwilioMediaMessage | TwilioStopMessage | {
  event: string;
};

const TOOLS = [
  {
    type: "function",
    name: "search_knowledge_base",
    description:
      "Αναζήτηση στη βάση γνώσης του οργανισμού για ακριβείς πληροφορίες πριν απαντήσεις.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Η ερώτηση ή το θέμα προς αναζήτηση",
        },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "transfer_to_human",
    description:
      "Μεταφορά σε πραγματικό υπάλληλο όταν δεν μπορείς να καλύψεις το αίτημα ή όταν το ζητήσει ο πελάτης.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Σύντομος λόγος μεταφοράς",
        },
      },
      required: ["reason"],
    },
  },
  {
    type: "function",
    name: "end_call",
    description: "Τερματισμός κλήσης όταν η συνομιλία ολοκληρώθηκε ευγενικά.",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Σύντομη περίληψη της κλήσης",
        },
      },
      required: ["summary"],
    },
  },
] as const;

function buildInstructions(org: OrgPayload) {
  return [
    `Οργανισμός: ${org.name}`,
    org.system_prompt,
    `Πολιτική μεταφοράς: ${org.transfer_policy}`,
    "Πριν απαντήσεις σε γεγονότα/πολιτικές/τιμές/ώρες, χρησιμοποίησε το tool search_knowledge_base.",
    "Αν δεν βρεις αρκετές πληροφορίες ή ο πελάτης ζητήσει άνθρωπο, χρησιμοποίησε transfer_to_human.",
    "Μίλα φυσικά, σύντομα και τηλεφωνικά. Μην εφευρίσκεις στοιχεία εκτός KB.",
  ].join("\n\n");
}

export class CallSession {
  private readonly twilioWs: WebSocket;
  private openaiWs: WebSocket | null = null;
  private streamSid: string | null = null;
  private callSid: string | null = null;
  private orgId: string | null = null;
  private org: OrgPayload | null = null;
  private closed = false;
  private transferred = false;

  constructor(twilioWs: WebSocket) {
    this.twilioWs = twilioWs;
    twilioWs.on("message", (data) => {
      void this.onTwilioMessage(data.toString());
    });
    twilioWs.on("close", () => {
      void this.shutdown("completed");
    });
  }

  private async onTwilioMessage(raw: string) {
    let message: TwilioMessage;
    try {
      message = JSON.parse(raw) as TwilioMessage;
    } catch {
      return;
    }

    switch (message.event) {
      case "start": {
        const start = (message as TwilioStartMessage).start;
        this.streamSid = start.streamSid;
        this.callSid = start.customParameters?.callSid || start.callSid;
        this.orgId = start.customParameters?.orgId ?? null;
        if (!this.orgId) {
          this.twilioWs.close();
          return;
        }
        this.org = await getOrg(this.orgId);
        await this.connectOpenAI();
        break;
      }
      case "media": {
        const payload = (message as TwilioMediaMessage).media.payload;
        this.sendOpenAI({
          type: "input_audio_buffer.append",
          audio: payload,
        });
        break;
      }
      case "stop": {
        await this.shutdown("completed");
        break;
      }
      default:
        break;
    }
  }

  private async connectOpenAI() {
    if (!this.org) return;

    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.realtimeModel)}`;
    this.openaiWs = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${config.openaiApiKey()}`,
      },
    });

    this.openaiWs.on("open", () => {
      console.log("OpenAI realtime connected", config.realtimeModel);
      this.sendOpenAI({
        type: "session.update",
        session: {
          type: "realtime",
          model: config.realtimeModel,
          instructions: buildInstructions(this.org!),
          output_modalities: ["audio"],
          tools: TOOLS,
          tool_choice: "auto",
          audio: {
            input: {
              format: { type: "audio/pcmu" },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
              },
            },
            output: {
              format: { type: "audio/pcmu" },
              voice: "alloy",
            },
          },
        },
      });

      this.sendOpenAI({
        type: "response.create",
        response: {
          output_modalities: ["audio"],
          instructions: `Ξεκίνα την κλήση με αυτό το greeting: ${this.org!.greeting}`,
        },
      });
    });

    this.openaiWs.on("message", (data) => {
      void this.onOpenAIMessage(data.toString());
    });

    this.openaiWs.on("close", (code, reason) => {
      console.log("OpenAI WS closed", code, reason.toString());
      void this.shutdown(this.transferred ? "transferred" : "completed");
    });

    this.openaiWs.on("error", (err) => {
      console.error("OpenAI WS error", err);
    });
  }

  private sendOpenAI(payload: Record<string, unknown>) {
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.send(JSON.stringify(payload));
    }
  }

  private sendTwilioAudio(payload: string) {
    if (!this.streamSid || this.twilioWs.readyState !== WebSocket.OPEN) return;
    this.twilioWs.send(
      JSON.stringify({
        event: "media",
        streamSid: this.streamSid,
        media: { payload },
      }),
    );
  }

  private async onOpenAIMessage(raw: string) {
    let event: {
      type: string;
      delta?: string;
      name?: string;
      call_id?: string;
      arguments?: string;
      response?: {
        output?: Array<{
          type?: string;
          name?: string;
          call_id?: string;
          arguments?: string;
        }>;
      };
    };

    try {
      event = JSON.parse(raw);
    } catch {
      return;
    }

    switch (event.type) {
      case "response.audio.delta":
      case "response.output_audio.delta": {
        if (event.delta) this.sendTwilioAudio(event.delta);
        break;
      }
      case "response.function_call_arguments.done": {
        await this.handleToolCall({
          name: event.name ?? "",
          call_id: event.call_id ?? "",
          arguments: event.arguments ?? "{}",
        });
        break;
      }
      case "response.done": {
        const outputs = event.response?.output ?? [];
        for (const item of outputs) {
          if (item.type === "function_call" && item.call_id) {
            await this.handleToolCall({
              name: item.name ?? "",
              call_id: item.call_id,
              arguments: item.arguments ?? "{}",
            });
          }
        }
        break;
      }
      case "error": {
        console.error("OpenAI realtime error", event);
        break;
      }
      default:
        break;
    }
  }

  private async handleToolCall(tool: {
    name: string;
    call_id: string;
    arguments: string;
  }) {
    if (!this.orgId || !this.callSid || !tool.call_id) return;

    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(tool.arguments || "{}") as Record<string, unknown>;
    } catch {
      args = {};
    }

    let result: unknown = { ok: false };

    try {
      switch (tool.name) {
        case "search_knowledge_base": {
          const query = String(args.query ?? "");
          const results = await searchKb(this.orgId, query);
          await logCallEvent(this.callSid, "search_knowledge_base", {
            query,
            results,
          });
          result = {
            results: results.map((r) => ({
              content: r.content,
              similarity: r.similarity,
            })),
          };
          break;
        }
        case "transfer_to_human": {
          const reason = String(args.reason ?? "Customer requested human");
          const transfer = await transferToHuman(
            this.orgId,
            this.callSid,
            reason,
          );
          result = transfer;
          if (transfer.transferred) {
            this.transferred = true;
            this.sendOpenAI({
              type: "response.create",
              response: {
                output_modalities: ["audio"],
                instructions:
                  "Πες σύντομα στον πελάτη ότι τον συνδέεις τώρα με συνάδελφο και μετά σταμάτα να μιλάς.",
              },
            });
            setTimeout(() => {
              void this.shutdown("transferred");
            }, 4000);
          } else {
            result = {
              ...transfer,
              message:
                "Δεν υπάρχει διαθέσιμος υπάλληλος. Ζήτησε τηλέφωνο επικοινωνίας για callback.",
            };
          }
          break;
        }
        case "end_call": {
          const summary = String(args.summary ?? "Call ended");
          result = { ok: true };
          this.sendOpenAI({
            type: "response.create",
            response: {
              output_modalities: ["audio"],
              instructions: "Πες ένα σύντομο ευγενικό αντίο.",
            },
          });
          setTimeout(() => {
            void this.shutdown("completed", summary);
          }, 2500);
          break;
        }
        default: {
          result = { error: `Unknown tool ${tool.name}` };
          break;
        }
      }
    } catch (err) {
      console.error("Tool call failed", tool.name, err);
      result = {
        ok: false,
        error: err instanceof Error ? err.message : "Tool failed",
      };
    }

    this.sendOpenAI({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: tool.call_id,
        output: JSON.stringify(result),
      },
    });
    this.sendOpenAI({ type: "response.create" });
  }

  private async shutdown(status: string, summary?: string) {
    if (this.closed) return;
    this.closed = true;

    try {
      if (this.callSid) {
        await completeCall(this.callSid, status, summary);
      }
    } catch (err) {
      console.error("Failed to complete call", err);
    }

    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.close();
    }
    if (this.twilioWs.readyState === WebSocket.OPEN) {
      this.twilioWs.close();
    }
  }
}
