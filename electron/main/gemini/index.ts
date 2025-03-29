import {
  GoogleGenerativeAI,
  ChatSession,
  GenerativeModel,
  Content,
} from "@google/generative-ai";


// 定义消息类型
export interface Message {
  role: "user" | "model";
  content: string;
  timestamp?: number;
}

// Gemini API 配置
const apiKey = "";
const genAI = new GoogleGenerativeAI(apiKey);

// 默认生成配置
const defaultGenerationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
export type partalConfig = Partial<typeof defaultGenerationConfig>;

/**
 * Gemini AI 客户端封装类
 */
export class GeminiClient {
  private model: GenerativeModel;
  private chatSession: ChatSession | null = null;
  private history: Message[] = [];

  /**
   * 创建一个新的 Gemini 客户端实例
   * @param modelName 模型名称
   * @param systemInstruction 系统指令
   */
  constructor(
    modelName: string = "gemini-2.0-flash",
    systemInstruction: string = "你是一个用来服务用户、解决用户的问题的人工智能助手"
  ) {
    this.model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    // 初始化聊天会话
    this.initSession();
  }

  /**
   * 初始化聊天会话
   * @private
   */
  private initSession() {
    this.chatSession = this.model.startChat({
      generationConfig: defaultGenerationConfig,
      history: this.prepareHistoryForSession(),
    });
  }

  /**
   * 将历史消息格式化为 Gemini API 所需的格式
   * @private
   * @returns 格式化的历史记录
   */
  private prepareHistoryForSession(): Content[] {
    return this.history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * 发送消息到 Gemini 并获取响应
   * @param message 用户消息
   * @returns AI 的响应消息
   */
  async sendMessage(message: string): Promise<Message> {
    try {
      // 如果会话不存在，重新初始化
      if (!this.chatSession) {
        this.initSession();
      }

      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      this.history.push(userMessage);

      const result = await this.chatSession!.sendMessage(message);
      const responseText = result.response.text();

      const aiMessage: Message = {
        role: "model",
        content: responseText,
        timestamp: Date.now(),
      };
      this.history.push(aiMessage);

      return aiMessage;
    } catch (error) {
      console.error("Gemini API 错误:", error);

      // 出错时返回错误消息
      const errorMessage: Message = {
        role: "model",
        content: "抱歉，我遇到了问题",
        timestamp: Date.now(),
      };

      return errorMessage;
    }
  }

  /**
   * 获取聊天历史记录
   * @returns 消息历史数组
   */
  getHistory(): Message[] {
    return [...this.history]; // 返回历史记录的副本
  }

  /**
   * 清空聊天历史
   */
  clearHistory() {
    this.history = [];
    // 重新初始化会话
    this.initSession();
    return true;
  }

  /**
   * 设置自定义生成配置
   * @param config 部分或完整的生成配置
   */
  setGenerationConfig(config: partalConfig) {
    // 合并用户提供的配置与默认配置
    const newConfig = { ...defaultGenerationConfig, ...config };

    // 创建新会话，应用新配置
    this.chatSession = this.model.startChat({
      generationConfig: newConfig,
      history: this.prepareHistoryForSession(),
    });
  }
}

// 创建默认客户端实例
export const defaultClient = new GeminiClient();


