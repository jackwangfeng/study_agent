import { create } from 'zustand';
import { api } from '../services/api';

interface UserInfo {
  id: string;
  openid: string;
  nickname?: string;
  avatar?: string;
  grade?: number;
  subjects?: string[];
  membershipLevel: string;
  examDate?: string;
}

interface Question {
  id: string;
  questionImage?: string;
  questionText: string;
  subject: string;
  knowledgePoint?: string;
  status: 'unmastered' | 'learning' | 'mastered';
  wrongCount: number;
  correctCount: number;
  createdAt: string;
}

interface PlanItem {
  id: string;
  type: 'review' | 'practice' | 'plan';
  title: string;
  subject: string;
  knowledgePoint?: string;
  targetCount: number;
  completedCount: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TodayPlan {
  id: string;
  items: PlanItem[];
  tomatoCount: number;
  totalMinutes: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AppState {
  user: UserInfo | null;
  todayPlan: TodayPlan | null;
  questions: Question[];
  weakPoints: Array<{ knowledgePoint: string; subject: string; wrongCount: number }>;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isLoggedIn: boolean;

  setUser: (user: UserInfo | null) => void;
  login: () => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  fetchTodayPlan: () => Promise<void>;
  fetchQuestions: (params?: any) => Promise<void>;
  fetchWeakPoints: (subject?: string) => Promise<void>;
  generatePlan: (data?: any) => Promise<void>;
  completePlanItem: (itemId: string, data?: any) => Promise<void>;
  markQuestionMastered: (questionId: string) => Promise<void>;
  addChatMessage: (message: ChatMessage) => void;
  sendChatMessage: (message: string, type?: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  todayPlan: null,
  questions: [],
  weakPoints: [],
  chatHistory: [],
  isLoading: false,
  isLoggedIn: false,

  setUser: (user) => set({ user }),

  login: async () => {
    try {
      set({ isLoading: true });
      const res = await api.auth.mockLogin();
      if (res.data) {
        set({
          user: res.data,
          isLoggedIn: true
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    api.auth.logout();
    set({
      user: null,
      isLoggedIn: false,
      todayPlan: null,
      questions: [],
      chatHistory: [],
    });
  },

  fetchUser: async () => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
      return;
    }

    try {
      const res = await api.user.getMe();
      if (res.data) {
        set({ user: res.data });
      }
    } catch (error) {
      console.error('Fetch user failed:', error);
    }
  },

  fetchTodayPlan: async () => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    try {
      const res = await api.plan.getToday();
      if (res.data) {
        set({ todayPlan: res.data });
      }
    } catch (error) {
      console.error('Fetch today plan failed:', error);
    }
  },

  fetchQuestions: async (params) => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    set({ isLoading: true });
    try {
      const res = await api.question.list(params);
      if (res.data) {
        set({ questions: res.data.items || [] });
      }
    } catch (error) {
      console.error('Fetch questions failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWeakPoints: async (subject) => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    try {
      const res = await api.question.getWeakPoints(subject);
      if (res.data) {
        set({ weakPoints: res.data.weakPoints || [] });
      }
    } catch (error) {
      console.error('Fetch weak points failed:', error);
    }
  },

  generatePlan: async (data) => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    try {
      const res = await api.plan.generate(data);
      if (res.data) {
        set({ todayPlan: res.data });
      }
    } catch (error) {
      console.error('Generate plan failed:', error);
    }
  },

  completePlanItem: async (itemId, data) => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    try {
      const res = await api.plan.completeItem(itemId, data);
      if (res.data) {
        set({ todayPlan: res.data });
      }
    } catch (error) {
      console.error('Complete plan item failed:', error);
    }
  },

  markQuestionMastered: async (questionId) => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }
    try {
      const res = await api.question.markMaster(questionId);
      if (res.data) {
        const questions = get().questions.map(q =>
          q.id === questionId ? res.data : q
        );
        set({ questions });
      }
    } catch (error) {
      console.error('Mark question mastered failed:', error);
    }
  },

  addChatMessage: (message) => {
    set({ chatHistory: [...get().chatHistory, message] });
  },

  sendChatMessage: async (message, type = 'general') => {
    if (!api.auth.isLoggedIn()) {
      await get().login();
    }

    const { addChatMessage } = get();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    try {
      const res = await api.ai.chat({ message, type });
      if (res.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.reply,
          createdAt: new Date().toISOString(),
        };
        addChatMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Send chat message failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，AI服务暂时不可用，请稍后再试。',
        createdAt: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
    }
  },
}));