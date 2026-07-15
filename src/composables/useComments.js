// src/composables/useComments.js
import { ref, onMounted } from 'vue';

export function useComments() {
  const comments = ref([]);
  const STORAGE_KEY = 'my_board_comments';

  // LocalStorage에서 댓글 전체 불러오기
  const loadComments = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        comments.value = JSON.parse(storedData);
      } catch (e) {
        console.error('댓글 데이터 파싱 실패:', e);
        comments.value = [];
      }
    } else {
      comments.value = [];
      saveComments();
    }
  };

  const saveComments = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments.value));
  };

  // 특정 게시글(boardId)에 달린 댓글들만 필터링해서 가져오기
  const getCommentsByBoardId = (boardId) => {
    return comments.value.filter(c => c.boardId === boardId);
  };

  // 댓글 생성 (비밀번호 포함)
  const addComment = (boardId, payload) => {
    const newComment = {
      id: Date.now(),
      boardId: boardId, // 어떤 게시글에 달린 댓글인지 매핑
      writer: payload.writer,
      content: payload.content,
      password: payload.password, // 삭제 시 검증용 비밀번호
      createdAt: new Date().toISOString()
    };
    comments.value.push(newComment);
    saveComments();
  };

  // 댓글 삭제 (비밀번호 검증)
  const deleteComment = (commentId, inputPassword) => {
    const comment = comments.value.find(c => c.id === commentId);
    if (!comment) return { success: false, message: '댓글을 찾을 수 없습니다.' };

    if (comment.password !== inputPassword) {
      return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }

    comments.value = comments.value.filter(c => c.id !== commentId);
    saveComments();
    return { success: true, message: '댓글이 삭제되었습니다.' };
  };

  onMounted(() => {
    loadComments();
  });

  return {
    comments,
    getCommentsByBoardId,
    addComment,
    deleteComment
  };
}