import { atom } from "jotai";

// 質問入力フォームの表示状態を管理するatom
export const showQuestionInputAtom = atom<boolean>(false);

// 質問内容を管理するatom
export const questionAtom = atom<string>("");

// get/set両対応のatom
export const actionPromptStateAtom = atom(
  (get) => ({
    showQuestionInput: get(showQuestionInputAtom),
    question: get(questionAtom),
  }),
  (_get, set, update: Partial<{ showQuestionInput: boolean; question: string }>) => {
    if (update.showQuestionInput !== undefined) {
      set(showQuestionInputAtom, update.showQuestionInput);
    }
    if (update.question !== undefined) {
      set(questionAtom, update.question);
    }
  }
);
