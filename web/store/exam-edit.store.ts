import { create } from 'zustand';
import { toast } from 'sonner';
import api from '@/lib/axios';
import {
  SectionResponse,
  SectionRequest,
  GroupResponse,
  GroupRequest,
  QuestionResponse,
  QuestionRequest,
} from '@/types/exam';

interface ExamEditState {
  loading: boolean;
  examId: string | null;
  sections: SectionResponse[];
  groups: Record<string, GroupResponse[]>; // sectionId -> groups
  questions: Record<string, QuestionResponse[]>; // sectionId or groupId -> questions

  // Part 7 state
  part7Type1QuestionCounts: number[];

  // Section actions
  fetchSections: (examId: string) => Promise<void>;
  createSection: (examId: string, sectionRequest: SectionRequest) => Promise<SectionResponse | null>;
  updateSection: (id: string, sectionRequest: SectionRequest) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Group actions
  fetchGroups: (sectionId: string) => Promise<void>;
  createGroup: (sectionId: string, groupRequest: GroupRequest) => Promise<GroupResponse | null>;
  updateGroup: (id: string, groupRequest: GroupRequest) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;

  // Question actions
  fetchQuestions: (sectionId: string, groupId?: string) => Promise<void>;
  createQuestion: (
    sectionId: string,
    questionRequest: QuestionRequest,
    groupId?: string
  ) => Promise<QuestionResponse | null>;
  updateQuestion: (id: string, questionRequest: QuestionRequest) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;

  // Part 7 actions
  setPart7Type1QuestionCounts: (counts: number[]) => void;
  handlePart7QuestionCountChange: (groupIndex: number, newCount: number) => void;

  // Clear state
  clearState: () => void;
}

const useExamEditStore = create<ExamEditState>((set, get) => ({
  loading: false,
  examId: null,
  sections: [],
  groups: {},
  questions: {},

  // Part 7 state
  part7Type1QuestionCounts: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],

  // Fetch sections
  fetchSections: async (examId: string) => {
    set({ loading: true, examId });
    try {
      const response = await api.get(`/exams/${examId}`);
      const sections = response.data.sections || [];
      set({ sections });
      
      // Extract groups and questions from sections
      const groupsMap: Record<string, GroupResponse[]> = {};
      const questionsMap: Record<string, QuestionResponse[]> = {};
      
      sections.forEach((section: any) => {
        // Questions without groups
        if (section.questions) {
          const standaloneQuestions = section.questions.filter((q: any) => !q.group_id);
          if (standaloneQuestions.length > 0) {
            questionsMap[section.id] = standaloneQuestions;
          }
        }
        
        // Groups and their questions
        if (section.groups) {
          groupsMap[section.id] = section.groups;
          section.groups.forEach((group: any) => {
            if (group.questions) {
              questionsMap[group.id] = group.questions;
            }
          });
        }
      });
      
      set((state) => ({
        groups: { ...state.groups, ...groupsMap },
        questions: { ...state.questions, ...questionsMap },
      }));
    } catch (error: any) {
      toast.error('Không thể tải sections');
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  // Create section
  createSection: async (examId: string, sectionRequest: SectionRequest) => {
    try {
      const response = await api.post(`/exams/${examId}/sections`, sectionRequest);
      const section = response.data;
      set((state) => ({
        sections: [...state.sections, section],
      }));
      toast.success('Tạo section thành công!');
      return section;
    } catch (error: any) {
      toast.error('Tạo section thất bại');
      console.error(error);
      return null;
    }
  },

  // Update section
  updateSection: async (id: string, sectionRequest: SectionRequest) => {
    try {
      const response = await api.patch(`/exams/sections/${id}`, sectionRequest);
      const updated = response.data;
      set((state) => ({
        sections: state.sections.map((s) => (s.id === id ? updated : s)),
      }));
      toast.success('Cập nhật section thành công!');
    } catch (error: any) {
      toast.error('Cập nhật section thất bại');
      console.error(error);
    }
  },

  // Delete section
  deleteSection: async (id: string) => {
    try {
      await api.delete(`/exams/sections/${id}`);
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== id),
      }));
      toast.success('Xóa section thành công!');
    } catch (error: any) {
      toast.error('Xóa section thất bại');
      console.error(error);
    }
  },

  // Fetch groups
  fetchGroups: async (sectionId: string) => {
    try {
      // Get groups from the section's exam
      const section = get().sections.find((s) => s.id === sectionId);
      if (section) {
        // Groups should be loaded from exam data
        // This will be populated when we fetch the exam
        return;
      }
      // Fallback: try to get from API if endpoint exists
      try {
        const response = await api.get(`/exams/sections/${sectionId}`);
        const groups = response.data.groups || [];
        set((state) => ({
          groups: { ...state.groups, [sectionId]: groups },
        }));
      } catch (err) {
        // Endpoint might not exist, that's okay
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
    }
  },

  // Create group
  createGroup: async (sectionId: string, groupRequest: GroupRequest) => {
    try {
      const response = await api.post(`/exams/sections/${sectionId}/groups`, groupRequest);
      const group = response.data;
      set((state) => ({
        groups: {
          ...state.groups,
          [sectionId]: [...(state.groups[sectionId] || []), group],
        },
      }));
      toast.success('Tạo group thành công!');
      return group;
    } catch (error: any) {
      toast.error('Tạo group thất bại');
      console.error(error);
      return null;
    }
  },

  // Update group
  updateGroup: async (id: string, groupRequest: GroupRequest) => {
    try {
      const response = await api.patch(`/exams/groups/${id}`, groupRequest);
      const updated = response.data;
      set((state) => {
        const newGroups = { ...state.groups };
        Object.keys(newGroups).forEach((sectionId) => {
          newGroups[sectionId] = newGroups[sectionId].map((g) =>
            g.id === id ? updated : g
          );
        });
        return { groups: newGroups };
      });
      toast.success('Cập nhật group thành công!');
    } catch (error: any) {
      toast.error('Cập nhật group thất bại');
      console.error(error);
    }
  },

  // Delete group
  deleteGroup: async (id: string) => {
    try {
      await api.delete(`/exams/groups/${id}`);
      set((state) => {
        const newGroups = { ...state.groups };
        Object.keys(newGroups).forEach((sectionId) => {
          newGroups[sectionId] = newGroups[sectionId].filter((g) => g.id !== id);
        });
        return { groups: newGroups };
      });
      toast.success('Xóa group thành công!');
    } catch (error: any) {
      toast.error('Xóa group thất bại');
      console.error(error);
    }
  },

  // Fetch questions
  fetchQuestions: async (sectionId: string, groupId?: string) => {
    try {
      // Lấy từ sections data đã có trong store (từ fetchSections)
      const section = get().sections.find((s) => s.id === sectionId);
      if (section) {
        const questions = groupId
          ? (section as any).groups?.find((g: any) => g.id === groupId)?.questions || []
          : (section as any).questions?.filter((q: any) => !q.group_id) || [];
        
        const key = groupId || sectionId;
        set((state) => ({
          questions: { ...state.questions, [key]: questions },
        }));
        return;
      }
      
      // Nếu không có trong store, fetch lại exam để có data mới nhất
      const examId = get().examId;
      if (examId) {
        await get().fetchSections(examId);
        // Sau khi fetch, lấy lại từ store
        const updatedSection = get().sections.find((s) => s.id === sectionId);
        if (updatedSection) {
          const questions = groupId
            ? (updatedSection as any).groups?.find((g: any) => g.id === groupId)?.questions || []
            : (updatedSection as any).questions?.filter((q: any) => !q.group_id) || [];
          
          const key = groupId || sectionId;
          set((state) => ({
            questions: { ...state.questions, [key]: questions },
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching questions:', error);
    }
  },

  // Create question
  createQuestion: async (
    sectionId: string,
    questionRequest: QuestionRequest,
    groupId?: string
  ) => {
    try {
      const response = await api.post(`/exams/sections/${sectionId}/questions`, {
        ...questionRequest,
        groupId,
      });
      const question = response.data;
      // Thêm correctAnswer từ request vào question (vì API không trả về cho admin)
      const questionWithAnswer = {
        ...question,
        correctAnswer: questionRequest.correctAnswer,
      };
      const key = groupId || sectionId;
      
      // Update questions trong store trực tiếp (không fetch lại để tránh reload accordion)
      set((state) => ({
        questions: {
          ...state.questions,
          [key]: [...(state.questions[key] || []), questionWithAnswer],
        },
      }));
      
      // Cập nhật sections data trong store để đồng bộ
      set((state) => {
        const updatedSections = state.sections.map((section) => {
          if (section.id === sectionId) {
            if (groupId) {
              // Thêm question vào group
              const updatedGroups = (section as any).groups?.map((group: any) => {
                if (group.id === groupId) {
                  return {
                    ...group,
                    questions: [...(group.questions || []), questionWithAnswer],
                  };
                }
                return group;
              });
              return { ...section, groups: updatedGroups };
            } else {
              // Thêm question vào section
              return {
                ...section,
                questions: [...((section as any).questions || []), questionWithAnswer],
              };
            }
          }
          return section;
        });
        return { sections: updatedSections };
      });
      
      toast.success('Tạo câu hỏi thành công!');
      return questionWithAnswer;
    } catch (error: any) {
      toast.error('Tạo câu hỏi thất bại');
      console.error(error);
      return null;
    }
  },

  // Update question
  updateQuestion: async (id: string, questionRequest: QuestionRequest) => {
    try {
      // Tìm sectionId và groupId từ question hiện tại
      const currentQuestions = get().questions;
      let sectionId: string | null = null;
      let groupId: string | undefined = undefined;
      
      for (const key in currentQuestions) {
        const question = currentQuestions[key].find((q) => q.id === id);
        if (question) {
          sectionId = question.section_id;
          groupId = question.group_id || undefined;
          break;
        }
      }
      
      const response = await api.patch(`/exams/questions/${id}`, questionRequest);
      const updated = response.data;
      // Thêm correctAnswer từ request vào question (vì API không trả về cho admin)
      const updatedWithAnswer = {
        ...updated,
        correctAnswer: questionRequest.correctAnswer,
      };
      
      // Update questions trong store trực tiếp (không fetch lại để tránh reload accordion)
      set((state) => {
        const newQuestions = { ...state.questions };
        Object.keys(newQuestions).forEach((key) => {
          newQuestions[key] = newQuestions[key].map((q) =>
            q.id === id ? updatedWithAnswer : q
          );
        });
        return { questions: newQuestions };
      });
      
      // Cập nhật sections data trong store để đồng bộ
      if (sectionId) {
        set((state) => {
          const updatedSections = state.sections.map((section) => {
            if (section.id === sectionId) {
              if (groupId) {
                // Update question trong group
                const updatedGroups = (section as any).groups?.map((group: any) => {
                  if (group.id === groupId) {
                    return {
                      ...group,
                      questions: (group.questions || []).map((q: any) =>
                        q.id === id ? updatedWithAnswer : q
                      ),
                    };
                  }
                  return group;
                });
                return { ...section, groups: updatedGroups };
              } else {
                // Update question trong section
                return {
                  ...section,
                  questions: ((section as any).questions || []).map((q: any) =>
                    q.id === id ? updatedWithAnswer : q
                  ),
                };
              }
            }
            return section;
          });
          return { sections: updatedSections };
        });
      }
      
      toast.success('Cập nhật câu hỏi thành công!');
    } catch (error: any) {
      toast.error('Cập nhật câu hỏi thất bại');
      console.error(error);
    }
  },

  // Delete question
  deleteQuestion: async (id: string) => {
    try {
      await api.delete(`/exams/questions/${id}`);
      set((state) => {
        const newQuestions = { ...state.questions };
        Object.keys(newQuestions).forEach((key) => {
          newQuestions[key] = newQuestions[key].filter((q) => q.id !== id);
        });
        return { questions: newQuestions };
      });
      toast.success('Xóa câu hỏi thành công!');
    } catch (error: any) {
      toast.error('Xóa câu hỏi thất bại');
      console.error(error);
    }
  },

  // Part 7 actions
  setPart7Type1QuestionCounts: (counts: number[]) => {
    set({ part7Type1QuestionCounts: counts });
  },

  handlePart7QuestionCountChange: (groupIndex: number, newCount: number) => {
    const currentCounts = get().part7Type1QuestionCounts;
    const newCounts = [...currentCounts];
    newCounts[groupIndex] = newCount;
    const newTotal = newCounts.reduce((sum, count) => sum + count, 0);
    
    // Nếu tổng > 29, hiển thị toast cảnh báo và không update
    if (newTotal > 29) {
      toast.error(
        `Tổng số câu hỏi của 10 bài đọc đầu (${newTotal} câu) vượt quá 29 câu. Vui lòng điều chỉnh lại.`
      );
      return;
    }
    
    // Nếu hợp lệ, update
    set({ 
      part7Type1QuestionCounts: newCounts,
    });
  },

  // Clear state
  clearState: () => {
    set({ 
      examId: null,
      sections: [], 
      groups: {}, 
      questions: {},
      part7Type1QuestionCounts: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    });
  },
}));

export default useExamEditStore;

