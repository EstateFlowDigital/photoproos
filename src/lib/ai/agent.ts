/**
 * AI Agent Service
 *
 * Handles conversations with Claude and tool execution.
 */

import Anthropic from "@anthropic-ai/sdk";
import { formatToolsForClaude, getToolByName } from "./tools/registry";
import { executeTool } from "./tools/executors";

// Validate API key at initialization
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set. AI features will not work.");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Maximum number of tool call iterations to prevent infinite loops
const MAX_TOOL_ITERATIONS = 10;

const SYSTEM_PROMPT = `You are a helpful AI assistant for PhotoProOS, a business platform for professional photographers. You help photographers manage their galleries, clients, bookings, invoices, and more.

You have access to tools that let you:
- View and search galleries, clients, bookings, and invoices
- Get revenue and expense summaries
- Analyze client value and forecast revenue
- Create new galleries, clients, bookings, and invoices (requires user confirmation)
- Update settings and deliver galleries (requires user confirmation)

Guidelines:
1. Be concise and helpful. Photographers are busy professionals.
2. Use tools to fetch real data when answering questions. Don't make assumptions.
3. When showing data, format it clearly with relevant metrics.
4. For actions that require confirmation, explain what will happen and ask for approval.
5. If you can't do something, explain why and suggest alternatives.
6. Keep track of context - remember what the user has asked about.

Current date: ${new Date().toLocaleDateString()}`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ToolUse {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

interface Context {
  organizationId: string;
  userId: string;
}

export interface AgentResponse {
  message: string;
  toolCalls?: {
    name: string;
    input: Record<string, unknown>;
    result: unknown;
    requiresConfirmation?: boolean;
  }[];
  pendingAction?: {
    id: string;
    name: string;
    description: string;
    params: Record<string, unknown>;
  };
  inputTokens: number;
  outputTokens: number;
}

export async function runAgent(
  messages: Message[],
  context: Context
): Promise<AgentResponse> {
  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      message: "AI features are not configured. Please set the ANTHROPIC_API_KEY environment variable.",
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  const tools = formatToolsForClaude();
  const toolCalls: AgentResponse["toolCalls"] = [];
  let pendingAction: AgentResponse["pendingAction"] | undefined;

  // Convert messages to Anthropic format
  const anthropicMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages: anthropicMessages,
    });
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return {
      message: "I'm sorry, I encountered an error while processing your request. Please try again.",
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  let totalInputTokens = response.usage.input_tokens;
  let totalOutputTokens = response.usage.output_tokens;

  // Handle tool calls with iteration limit
  let iterations = 0;
  while (response.stop_reason === "tool_use" && iterations < MAX_TOOL_ITERATIONS) {
    iterations++;
    const toolUses = response.content.filter(
      (block): block is ToolUse => block.type === "tool_use"
    );

    const toolResults: ToolResult[] = [];

    for (const toolUse of toolUses) {
      const toolDef = getToolByName(toolUse.name);

      // Execute the tool
      const result = await executeTool(
        toolUse.name,
        toolUse.input,
        context
      );

      toolCalls.push({
        name: toolUse.name,
        input: toolUse.input,
        result: result.data,
        requiresConfirmation: toolDef?.requiresConfirmation,
      });

      // Check if this requires confirmation
      if (
        result.success &&
        typeof result.data === "object" &&
        result.data !== null &&
        "requiresConfirmation" in result.data
      ) {
        pendingAction = {
          id: toolUse.id,
          name: toolUse.name,
          description: getActionDescription(toolUse.name, toolUse.input),
          params: toolUse.input,
        };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Continue conversation with tool results
    try {
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools,
        messages: [
          ...anthropicMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
    } catch (error) {
      console.error("Error continuing Anthropic API conversation:", error);
      return {
        message: "I'm sorry, I encountered an error while processing your request. Please try again.",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      };
    }
  }

  // Check if we hit the iteration limit
  if (iterations >= MAX_TOOL_ITERATIONS) {
    console.warn("AI agent hit maximum tool iterations limit");
  }

  // Extract final text response
  const textContent = response.content.find(
    (block): block is { type: "text"; text: string } => block.type === "text"
  );

  return {
    message: textContent?.text || "I apologize, I couldn't generate a response.",
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    pendingAction,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  };
}

function getActionDescription(
  toolName: string,
  params: Record<string, unknown>
): string {
  switch (toolName) {
    case "create_gallery":
      return `Create a new gallery named "${params.name}"`;
    case "create_client":
      return `Create a new client: ${params.name} (${params.email})`;
    case "create_booking":
      return `Schedule a booking for ${params.date}`;
    case "create_invoice":
      return `Create an invoice for the client`;
    case "deliver_gallery":
      return `Deliver the gallery to the client`;
    case "update_gallery":
      return `Update gallery settings`;
    case "update_settings":
      return `Update ${params.settingType} settings`;
    default:
      return `Execute ${toolName}`;
  }
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Claude Sonnet pricing (as of 2024)
  const inputCostPer1M = 3; // $3 per 1M input tokens
  const outputCostPer1M = 15; // $15 per 1M output tokens

  const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;

  return inputCost + outputCost;
}
